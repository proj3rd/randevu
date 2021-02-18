import { Database } from "arangojs";
import { Transaction } from "arangojs/transaction";
import { Express } from 'express';
import { COLLECTION_CHANGE, COLLECTION_FEATURE, COLLECTION_FEATURE_VERSION, COLLECTION_USER, EDGE_COLLECTION_DESCRIBES, EDGE_COLLECTION_FORKED_FROM, EDGE_COLLECTION_IMPLEMENTS, EDGE_COLLECTION_OWNS } from "../constants";
import { User } from "randevu-shared/dist/types";
import { validateString } from "../utils";
import { findUserByName } from "./user";

export function serviceFeature(app: Express, db: Database) {
  app.get('/features/:featureId/versions/:version/changes', async (req, res) => {
    const user = req.user as User;
    if (!user) {
      return res.status(403).end();
    }
    let trx: Transaction | undefined;
    try {
      const collectionChange = db.collection(COLLECTION_CHANGE);
      const collectionDescribes = db.collection(EDGE_COLLECTION_DESCRIBES);
      const collectionFeatureVersion = db.collection(COLLECTION_FEATURE_VERSION);
      trx = await db.beginTransaction({
        read: [collectionChange, collectionDescribes, collectionFeatureVersion],
      });
      console.log(req.params);
      const { featureId, version: versionString } = req.params;
      const feature = await findFeatureByFeatureId(db, trx, featureId);
      if (!feature) {
        await trx.abort();
        return res.status(404).json({ reason: 'Feature not found' });
      }
      const version = +versionString;
      const featureVersion = await findFeatureVersion(db, trx, featureId, version);
      if (!featureVersion) {
        await trx.abort();
        return res.status(404).json({ reason: 'Feature version not found' });
      }
      const cursorChangeListFound = await trx.step(() => db.query ({
        query: `
          FOR change IN @@collectionChange
            FOR featureVersion IN OUTBOUND change._id @@collectionDescribes
              FILTER featureVersion._id == @featureVersionId
              LIMIT 1
              RETURN change
        `,
        bindVars: {
          '@collectionChange': collectionChange.name,
          featureVersionId: featureVersion._id,
          '@collectionDescribes': collectionDescribes.name,
        },
      }));
      const changeListFound = await cursorChangeListFound.all();
      const changeList = changeListFound[0] || [];
      await trx.commit();
      return res.json(changeList);
    } catch (e) {
      if (trx) {
        await trx.abort();
      }
      console.error(e);
      return res.status(500).end();
    }
  });

  app.get('/features/:featureId/versions', async (req, res) => {
    const user = req.user as User;
    if (!user) {
      return res.status(403).end();
    }
    let trx: Transaction | undefined;
    try {
      const collectionFeature = db.collection(COLLECTION_FEATURE);
      const collectionForkedFrom = db.collection(EDGE_COLLECTION_FORKED_FROM);
      const collectionImplements = db.collection(EDGE_COLLECTION_IMPLEMENTS);
      trx = await db.beginTransaction({
        read: [collectionFeature, collectionForkedFrom, collectionImplements],
      });
      const { featureId } = req.params;
      const cursorVersionListFound = await trx.step(() => db.query({
        query: `
          FOR feature IN @@collectionFeature
            FILTER feature.featureId == @featureId
            LIMIT 1
            LET versionList = APPEND([
              { version: 1, previousVersion: null }
            ], (
              FOR featureVersion IN INBOUND feature @@collectionImplements
                FOR previousFeatureVersion IN OUTBOUND featureVersion @@collectionForkedFrom
                  RETURN { version: featureVersion.version, previousVersion: previousFeatureVersion.version }
            ))
            RETURN versionList
        `,
        bindVars: {
          '@collectionFeature': collectionFeature.name,
          featureId,
          '@collectionImplements': collectionImplements.name,
          '@collectionForkedFrom': collectionForkedFrom.name,
        },
      }));
      const versionListFound = await cursorVersionListFound.all();
      if (!versionListFound.length) {
        await trx.abort();
        return res.status(404).end();
      }
      const versionList = versionListFound[0];
      await trx.commit();
      return res.json(versionList);
    } catch (e) {
      if (trx) {
        await trx.abort();
      }
      console.error(e);
      return res.status(500).end();
    }
  });

  app.post('/features/:featureId/versions', async (req, res) => {
    const user = req.user as User;
    if (!user) {
      return res.status(403).end();
    }
    let trx: Transaction | undefined;
    try {
      const collectionChange = db.collection(COLLECTION_CHANGE);
      const collectionDescribes = db.collection(EDGE_COLLECTION_DESCRIBES);
      const collectionFeature = db.collection(COLLECTION_FEATURE);
      const collectionFeatureVersion = db.collection(COLLECTION_FEATURE_VERSION);
      const collectionForkedFrom = db.collection(EDGE_COLLECTION_FORKED_FROM);
      const collectionImplements = db.collection(EDGE_COLLECTION_IMPLEMENTS);
      const collectionOwns = db.collection(EDGE_COLLECTION_OWNS);
      const collectionUser = db.collection(COLLECTION_USER);
      trx = await db.beginTransaction({
        read: [collectionFeature, collectionOwns, collectionUser],
        write: [collectionChange, collectionDescribes, collectionFeatureVersion, collectionForkedFrom, collectionImplements],
      });
      const { username } = user;
      const { featureId } = req.params;
      // Find a feature
      const cursorFeatureFound = await trx.step(() => db.query({
        query: `
          FOR feature IN @@collectionFeature
            FILTER feature.featureId == @featureId
            LIMIT 1
            RETURN { _id: feature._id }
        `,
        bindVars: { '@collectionFeature': collectionFeature.name, featureId },
      }));
      const featureFound = await cursorFeatureFound.all();
      if (!featureFound.length) {
        await trx.abort();
        return res.status(404).end();
      }
      const feature_id = featureFound[0]._id;
      // Find a previous version
      const previousVersion = +req.body.previousVersion;
      // TODO: Check if previousVersion is integer
      const cursorPreviousFeature_idFound = await trx.step(() => db.query({
        query: `
          FOR featureVersion IN INBOUND @feature_id @@collectionImplements
            FILTER featureVersion.version == @previousVersion
            LIMIT 1
            RETURN featureVersion._id
        `,
        bindVars: {
          feature_id,
          '@collectionImplements': collectionImplements.name,
          previousVersion,
        },
      }));
      const previousFeature_idFound = await cursorPreviousFeature_idFound.all();
      if (!previousFeature_idFound.length) {
        await trx.abort();
        return res.status(400).json({ reason: 'Previous version not found' });
      }
      const previousFeature_id = previousFeature_idFound[0];
      // Check ownership
      const cursorOwnerFound = await trx.step(() => db.query({
        query: `
          FOR user IN INBOUND @feature_id @@collectionOwns
            FILTER user.username == @username
            LIMIT 1
            RETURN true
        `,
        bindVars: {
          feature_id,
          '@collectionOwns': collectionOwns.name,
          username,
        },
      }));
      const ownerFound = await cursorOwnerFound.all();
      if (!ownerFound.length) {
        await trx.abort();
        return res.status(403).end();
      }
      // Get a list of versions
      const cursorVersionList = await trx.step(() => db.query({
        query: `
          FOR featureVersion IN INBOUND @feature_id @@collectionImplements
            RETURN featureVersion.version
        `,
        bindVars: { feature_id, '@collectionImplements': collectionImplements.name },
      }));
      const versionList = await cursorVersionList.all();
      const version = Math.max(...versionList) + 1;
      const featureVersion = await trx.step(() => collectionFeatureVersion.save({
        version,
      }));
      await trx.step(() => collectionImplements.save({
        _from: featureVersion._id,
        _to: feature_id,
      }));
      await trx.step(() => collectionForkedFrom.save({
        _from: featureVersion._id,
        _to: previousFeature_id,
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

  app.get('/features/:featureId', async (req, res) => {
    const user = req.user as User;
    if (!user) {
      return res.status(403).end();
    }
    let trx: Transaction | undefined;
    try {
      const collectionFeature = db.collection(COLLECTION_FEATURE);
      const collectionOwns = db.collection(EDGE_COLLECTION_OWNS);
      trx = await db.beginTransaction({
        read: collectionFeature,
      });
      const { featureId } = req.params;
      const cursorFeatureInfoFound = await trx.step(() => db.query({
        query: `
          FOR feature IN @@collectionFeature
            FILTER feature.featureId == @featureId
            LIMIT 1
            FOR owner IN INBOUND feature @@collectionOwns
              RETURN { featureId: @featureId, featureName: feature.featureName, owner: owner.username }
        `,
        bindVars: {
          '@collectionFeature': collectionFeature.name, featureId,
          '@collectionOwns': collectionOwns.name,
        },
      }));
      const featureInfoFound = await cursorFeatureInfoFound.all();
      if (!featureInfoFound.length) {
        await trx.abort();
        return res.status(404).end();
      }
      const featureInfo = featureInfoFound[0];
      await trx.commit();
      return res.json(featureInfo);
    } catch (e) {
      if (trx) {
        await trx.abort();
      }
      console.error(e);
      return res.status(500).end();
    }
  });

  app.get('/features', async (req, res) => {
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

  app.post('/features',  async (req, res) => {
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
      const collectionChange = db.collection(COLLECTION_CHANGE);
      const collectionDescribes = db.collection(EDGE_COLLECTION_DESCRIBES);
      const collectionUser = db.collection(COLLECTION_USER);
      const collectionFeature = db.collection(COLLECTION_FEATURE);
      const collectionFeatureVersion = db.collection(COLLECTION_FEATURE_VERSION);
      const collectionImplements = db.collection(EDGE_COLLECTION_IMPLEMENTS);
      const collectionOwns = db.collection(EDGE_COLLECTION_OWNS);
      trx = await db.beginTransaction({
        read: collectionUser,
        write: [collectionChange, collectionDescribes, collectionFeature, collectionFeatureVersion, collectionImplements, collectionOwns],
      });
      const featureExisting = await findFeatureByFeatureId(db, trx, featureId);
      if (featureExisting) {
        await trx.abort();
        return res.status(400).json({ reason: `Duplicate feature ID` });
      }
      const feature = await trx.step(() => collectionFeature.save({ featureId, featureName }));
      const userFound = await findUserByName(db, trx, username);
      if (!userFound) {
        await trx.abort();
        return res.status(400).json({ reason: 'User not found' });
      }
      await trx.step(() => collectionOwns.save({
        _from: userFound._id,
        _to: feature._id,
      }));
      const featureVersion = await trx.step(() => collectionFeatureVersion.save({
        version: 1,
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

async function findFeatureByFeatureId(db: Database, trx: Transaction, featureId: string) {
  const cursorFeatureFound = await trx.step(() => db.query({
    query: `
      FOR feature IN @@collectionFeature
        FILTER feature.featureId == @featureId
        LIMIT 1
        return feature
    `,
    bindVars: { '@collectionFeature': COLLECTION_FEATURE, featureId },
  }));
  const featureFound = await cursorFeatureFound.all();
  return featureFound[0];
}

async function findFeatureVersion(db: Database, trx: Transaction, featureId: string, version: number) {
  console.log(featureId);
  console.log(typeof version);
  console.log(version);
  const cursorVersionFound = await trx.step(() => db.query({
    query: `
      FOR featureVersion IN @@collectionFeatureVersion
        FILTER featureVersion.version == @version
        FOR feature IN OUTBOUND featureVersion._id @@collectionImplements
          FILTER feature.featureId == @featureId
          LIMIT 1
          RETURN featureVersion
    `,
    bindVars: {
      '@collectionFeatureVersion': COLLECTION_FEATURE_VERSION,
      version,
      '@collectionImplements': EDGE_COLLECTION_IMPLEMENTS,
      featureId,
    },
  }));
  const versionFound = await cursorVersionFound.all();
  return versionFound[0];
}
