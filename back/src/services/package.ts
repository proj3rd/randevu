import { Database } from "arangojs";
import { Transaction } from "arangojs/transaction";
import { Express } from 'express';
import { COLLECTION_FEATURE, COLLECTION_PACKAGE_MAIN, COLLECTION_USER, EDGE_COLLECTION_OWNS } from "../constants";
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
    const { packageName, owner } = req.body;
    if (!validateString(packageName) || !validateString(owner)) {
      return res.status(400).end();
    }
    let trx: Transaction | undefined;
    try {
      const collectionUser = db.collection(COLLECTION_USER);
      const collectionPackageMain = db.collection(COLLECTION_PACKAGE_MAIN);
      const collectionOwns = db.collection(EDGE_COLLECTION_OWNS);
      trx = await db.beginTransaction({
        read: collectionUser,
        write: [collectionPackageMain, collectionOwns],
      });
      const cursorPackageFound = await trx.step(() => db.query({
        query: `
          FOR pacakge IN @@collectionPackage
            FILTER pacakge.packageName == @packageName
            LIMIT 1
            RETURN pacakge._id
        `,
        bindVars: {
          '@collectionPackage': collectionPackageMain.name, packageName,
        },
      }));
      const packageFound = await cursorPackageFound.all();
      if (packageFound.length) {
        await trx.abort();
        return res.status(400).json({ reason: `Duplicate package name` });
      }
      const pkg = await trx.step(() => collectionPackageMain.save({ packageName }));
      const cursorUserDocIdFound = await trx.step(() => db.query({
        query: `
          FOR user in @@collectionUser
            FILTER user.username == @owner
            LIMIT 1
            RETURN user._id
        `,
        bindVars: { '@collectionUser': collectionUser.name, owner },
      }));
      const userDocIdFound = await cursorUserDocIdFound.all();
      if (!userDocIdFound.length) {
        await trx.abort();
        return res.status(400).json({ reason: 'User not found' });
      }
      const userDocId = userDocIdFound[0];
      await trx.step(() => collectionOwns.save({
        _from: userDocId,
        _to: pkg._id,
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
