import { Database } from "arangojs";
import { Transaction } from "arangojs/transaction";
import { Express } from 'express';
import { COLLECTION_FEATURE, COLLECTION_FEATURE_VERSION, COLLECTION_USER, EDGE_COLLECTION_IMPLEMENTS, EDGE_COLLECTION_OWNS } from "../constants";
import { User } from "randevu-shared/dist/types";
import { validateString } from "../utils";

export function servicePackage(app: Express, db: Database) {
  app.get('/packages', async (req, res) => {
    const user = req.user as User;
    if(!user) {
      return res.status(403).end();
    }
    let trx: Transaction | undefined;
    try {
      const collectionFeature = db.collection(COLLECTION_FEATURE);
      const collectionOwns = db.collection(EDGE_COLLECTION_OWNS);
      const collectionUser = db.collection(COLLECTION_USER);
      trx = await db.beginTransaction({
        read: [collectionFeature, collectionOwns, collectionUser],
      });
      const { featureId, featureName, owner } = req.query;
      const filterList = [];
      const bindVarsFilter = {} as any;
      if (featureId) {
        filterList.push(`feature.featureId LIKE CONCAT('%', @featureId, '%')`);
        bindVarsFilter.featureId = featureId;
      }
      if (featureName) {
        filterList.push(`feature.featureName LIKE CONCAT('%', @featureName, '%')`);
        bindVarsFilter.featureName = featureName;
      }
      if (owner) {
        filterList.push(`owner.username LIKE CONCAT('%', @owner, '%')`);
        bindVarsFilter.owner = owner;
      }
      const filter = filterList.length ? `FILTER ${filterList.join(' AND ')}` : '';
      const cursorFeatureWithOwnerList = await trx.step(() => db.query({
        query: `
          FOR feature in @@collectionFeature
            FOR owner IN INBOUND feature @@collectionOwns
              ${filter}
              RETURN {
                featureId: feature.featureId,
                featureName: feature.featureName,
                owner: owner.username
              }
        `,
        bindVars: {
          '@collectionFeature': COLLECTION_FEATURE,
          '@collectionOwns': EDGE_COLLECTION_OWNS,
          ...bindVarsFilter,
        },
      }));
      const featureWithOwnerList = await cursorFeatureWithOwnerList.all();
      await trx.commit();
      return res.json(featureWithOwnerList);
    } catch (e) {
      if (trx) {
        await trx.abort();
      }
      console.error(e);
      return res.status(500).end();
    }
  });

  app.post('/packages', async (req, res) => {
    const user = req.user as User;
    if (!user || user.role !== 'admin') {
      return res.status(403).end();
    }
    const { featureId, featureName, username } = req.body;
    if (!validateString(featureId) || !validateString(featureName) || !validateString(username)) {
      return res.status(400).end();
    }
    let trx: Transaction | undefined;
    try {
      const collectionUser = db.collection(COLLECTION_USER);
      const collectionFeature = db.collection(COLLECTION_FEATURE);
      const collectionFeatureVersion = db.collection(COLLECTION_FEATURE_VERSION);
      const collectionImplements = db.collection(EDGE_COLLECTION_IMPLEMENTS);
      const collectionOwns = db.collection(EDGE_COLLECTION_OWNS);
      trx = await db.beginTransaction({
        read: collectionUser,
        write: [collectionFeature, collectionFeatureVersion, collectionImplements, collectionOwns],
      });
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
      const cursorUserDocIdFound = await trx.step(() => db.query({
        query: `
          FOR user in @@collectionUser
            FILTER user.username == @username
            LIMIT 1
            RETURN user._id
        `,
        bindVars: { '@collectionUser': COLLECTION_USER, username },
      }));
      const userDocIdFound = await cursorUserDocIdFound.all();
      if (!userDocIdFound.length) {
        await trx.abort();
        return res.status(400).json({ reason: 'User not found' });
      }
      const userDocId = userDocIdFound[0];
      await trx.step(() => collectionOwns.save({
        _from: userDocId,
        _to: feature._id,
      }));
      const featureVersion = await trx.step(() => collectionFeatureVersion.save({
        version: 1,
        revision: 0,
      }));
      await trx.step(() => collectionImplements.save({
        _from: featureVersion._id,
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
