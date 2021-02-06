import { Database } from "arangojs";
import { Transaction } from "arangojs/transaction";
import { Express } from 'express';
import { COLLECTION_FEATURE, COLLECTION_USER, EDGE_COLLECTION_OWNS } from "../constants";
import { User } from "../types";
import { validateString } from "../utils";

export function serviceFeature(app: Express, db: Database) {
  app.post('/features',  async (req, res) => {
    const user = req.user as User;
    if (!user || user.role !== 'admin') {
      return res.status(403).end();
    }
    const { featureId, featureName, ownerId } = req.body;
    if (!validateString(featureId) || !validateString(featureName) || !validateString(ownerId)) {
      return res.status(400).end();
    }
    let trx: Transaction | undefined;
    try {
      const collectionUser = db.collection(COLLECTION_USER);
      const collectionFeature = db.collection(COLLECTION_FEATURE);
      const collectionOwns = db.collection(EDGE_COLLECTION_OWNS);
      trx = await db.beginTransaction({
        read: [COLLECTION_USER],
        write: [COLLECTION_FEATURE, EDGE_COLLECTION_OWNS],
      });
      const existsUser = await trx.step(() => collectionUser.documentExists(ownerId));
      if (!existsUser) {
        await trx.abort();
        return res.status(400).json({ reason: 'User not found' });
      }
      const cursorFeatureFound = await trx.step(() => db.query({
        query: `
          FOR feature IN @@collectionFeature
            FILTER feature.featureId == @featureId
            LIMIT 1
            RETURN feature._id
        `,
        bindVars: {
          '@collectionFeature': COLLECTION_FEATURE, featureId,
        },
      }));
      const featureFound = await cursorFeatureFound.all();
      if (featureFound.length) {
        await trx.abort();
        return res.status(400).json({ reason: `Duplicate feature ID` });
      }
      const feature = await trx.step(() => collectionFeature.save({ featureId, featureName }));
      await trx.step(() => collectionOwns.save({
        _from: ownerId,
        _to: feature._id,
      }));
      await trx.commit();
      return res.status(200).end();
    } catch (e) {
      if (trx) {
        await trx.abort();
      }
      console.error(e);
      return res.status(500).end();
    }
  });
}
