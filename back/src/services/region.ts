import { Database } from "arangojs";
import { Transaction } from "arangojs/transaction";
import { Express } from "express";
import { DocUser } from "randevu-shared/dist/types";
import { isAdmin } from "randevu-shared/dist/utils";
import { COLLECTION_REGION, EDGE_COLLECTION_BELONGS_TO } from "../constants";
import { validateString } from "../utils";

export function serviceRegion(app: Express, db: Database) {
  app.get('/regions', async (req, res) => {
    const user = req.user as DocUser;
    if (!user) {
      return res.status(403).end();
    }
    let trx: Transaction | undefined;
    try {
      const collectionBelongsTo = db.collection(EDGE_COLLECTION_BELONGS_TO);
      const collectionRegion = db.collection(COLLECTION_REGION);
      trx = await db.beginTransaction({
        read: [collectionBelongsTo, collectionRegion],
      });
      const cursorRegionList = await trx.step(() => db.query({
        query: `
          FOR region IN @@collectionRegion
            let belongsTo = (
              FOR regionUpper IN OUTBOUND region._id @@collectionBelongsTo
                LIMIT 1
                RETURN regionUpper._id
            )[0]
            RETURN MERGE (region, { belongsTo })
        `,
        bindVars: {
          '@collectionRegion': collectionRegion.name,
          '@collectionBelongsTo': collectionBelongsTo.name,
        },
      }));
      const regionList = await cursorRegionList.all();
      await trx.commit();
      return res.json(regionList);
    } catch (e) {
      console.error(e);
      if (trx) {
        await trx.abort();
      }
      return res.status(500).end();
    }
  });

  app.post('/regions', async (req, res) => {
    const user = req.user as DocUser;
    if (!isAdmin(user)) {
      return res.status(403).end();
    }
    const { name, belongsTo } = req.body;
    if (!name || !validateString(name) || (belongsTo && !validateString(belongsTo))) {
      return res.status(400).end();
    }
    let trx: Transaction | undefined;
    try {
      const collectionBelongsTo = db.collection(EDGE_COLLECTION_BELONGS_TO);
      const collectionRegion = db.collection(COLLECTION_REGION);
      trx = await db.beginTransaction({
        write: [collectionBelongsTo, collectionRegion],
      });
      if (belongsTo) {
        const existsBelongsTo = await trx.step(() => collectionRegion.documentExists(belongsTo));
        if (!existsBelongsTo) {
          await trx.abort();
          return res.status(400).json({ reason: 'A region indicated by `belongsTo` does not exist' });
        }
        const cursorExistingRegionList = await trx.step(() => db.query({
          query: `
            FOR region IN INBOUND @belongsTo @@collectionBelongsTo
              FILTER region.name == @name
              LIMIT 1
              RETURN region
          `,
          bindVars: {
            belongsTo,
            '@collectionBelongsTo': collectionBelongsTo.name,
            name,
          },
        }));
        const existingRegionList = await cursorExistingRegionList.all();
        if (existingRegionList.length) {
          await trx.abort();
          return res.status(400).json({ reason: 'Duplicate region name under a given region' });
        }
      } else {
        const cursorTopLevelRegionList = await trx.step(() => db.query({
          query: `
            FOR region IN @@collectionRegion
              let numBelongsTo = (
                FOR regionUpper, belongsTo IN OUTBOUND region._id @@collectionBelongsTo
                  COLLECT AGGREGATE numBelongsTo = LENGTH(1)
                  RETURN numBelongsTo
              )
              FILTER numBelongsTo[0] == 0
              LIMIT 1
              RETURN region
          `,
          bindVars: {
            '@collectionRegion': collectionRegion.name,
            '@collectionBelongsTo': collectionBelongsTo.name,
          },
        }));
        const topLevelRegionList = await cursorTopLevelRegionList.all();
        if (topLevelRegionList.length) {
          await trx.abort();
          return res.status(400).json({ reason: 'Top level region already exists' });
        }
      }
      const region = await trx.step(() => collectionRegion.save({ name }));
      if (belongsTo) {
        await trx.step(() => collectionBelongsTo.save({
          _from: region._id,
          _to: belongsTo,
        }));
      }
      await trx.commit();
      return res.status(200).end();
    } catch (e) {
      console.error(e);
      if (trx) {
        await trx.abort();
      }
      return res.status(500).end();
    }
  });
}
