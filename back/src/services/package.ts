import { Database } from "arangojs";
import { Transaction } from "arangojs/transaction";
import { Express } from 'express';
import { COLLECTION_OPERATOR, COLLECTION_PACKAGE_MAIN, COLLECTION_PACKAGE_SUB, COLLECTION_USER, EDGE_COLLECTION_DERIVED_FROM, EDGE_COLLECTION_OWNS, EDGE_COLLECTION_SUCCEEDS, EDGE_COLLECTION_TARGETS } from "../constants";
import { DocUser } from "randevu-shared/dist/types";
import { mergeObjectList, validateString, validateStringList } from "../utils";

export function servicePackage(app: Express, db: Database) {
  app.get('/packages/main/:seqVal', async (req, res) => {
    const user = req.user as DocUser;
    if(!user) {
      return res.status(403).end();
    }
    const { include: includeList } = req.query;
    if (includeList && !validateStringList(includeList)) {
      return res.status(400).end();
    }
    let trx: Transaction | undefined;
    try {
      const collectionPackageMain = db.collection(COLLECTION_PACKAGE_MAIN);
      trx = await db.beginTransaction({
        read: [collectionPackageMain],
      });
      const { seqVal } = req.params;
      // Main packages
      const _idMain = `${collectionPackageMain.name}/${seqVal}`;
      const cursorPackageMainList = await trx.step(() => db.query({
        query: `
          FOR package IN @@collectionPackageMain
            FILTER package._id == @_idMain
            LIMIT 1
            RETURN package
        `,
        bindVars: { '@collectionPackageMain': collectionPackageMain.name, _idMain },
      }));
      const packageMainList = await cursorPackageMainList.all();
      if (!packageMainList.length) {
        await trx.abort();
        return res.status(404).end();
      }
      await trx.commit();
      return res.json(packageMainList[0]);
    } catch (e) {
      if (trx) {
        await trx.abort();
      }
      console.error(e);
      return res.status(500).end();
    }
  });

  app.get('/packages/main/:seqVal/sub', async (req, res) => {
    const user = req.user as DocUser;
    if(!user) {
      return res.status(403).end();
    }
    const { include: includeList } = req.query;
    if (includeList && !validateStringList(includeList)) {
      return res.status(400).end();
    }
    let trx: Transaction | undefined;
    try {
      const collectionDerivedFrom = db.collection(EDGE_COLLECTION_DERIVED_FROM);
      const collectionOperator = db.collection(COLLECTION_OPERATOR);
      const collectionOwns = db.collection(EDGE_COLLECTION_OWNS);
      const collectionPackageMain = db.collection(COLLECTION_PACKAGE_MAIN);
      const collectionPackageSub = db.collection(COLLECTION_PACKAGE_SUB);
      const collectionSucceeds = db.collection(EDGE_COLLECTION_SUCCEEDS);
      const collectionTargets = db.collection(EDGE_COLLECTION_TARGETS);
      const collectionUser = db.collection(COLLECTION_USER);
      trx = await db.beginTransaction({
        read: [collectionDerivedFrom, collectionPackageMain, collectionPackageSub, collectionOperator, collectionOwns, collectionTargets, collectionSucceeds, collectionUser],
      });
      const { seqVal } = req.params;
      // Sub packages
      const _idMain = `${collectionPackageMain.name}/${seqVal}`;
      const cursorPackageSubList = await trx.step(() => db.query({
        query: `
          FOR package IN INBOUND @_idMain @@collectionDerivedFrom
            FOR packageMain IN OUTBOUND package._id @@collectionDerivedFrom
              RETURN MERGE(package, { main: packageMain._id })
        `,
        bindVars: { _idMain, '@collectionDerivedFrom': collectionDerivedFrom.name },
      }));
      const packageSubList = await cursorPackageSubList.all();
      const packageIdList = packageSubList.map((packageSub) => packageSub._id);
      // Operator
      const cursorOperatorDocList = await trx.step(() => db.query({
        query: `
          FOR id IN @packageIdList
            FOR operator IN OUTBOUND id @@collectionTargets
              RETURN { _id: id, operator: operator._id }
        `,
        bindVars: { packageIdList, '@collectionTargets': collectionTargets.name },
      }));
      const operatorDocList = await cursorOperatorDocList.all();
      mergeObjectList(packageSubList, operatorDocList, '_id');
      // Owner
      if (includeList && (includeList as string[]).includes('owner')) {
        const cursorOwnerList = await trx.step(() => db.query({
          query: `
            FOR id IN @packageIdList
              FOR user IN INBOUND id @@collectionOwns
                RETURN { _id: id, owner: user._id }
          `,
          bindVars: { packageIdList, '@collectionOwns': collectionOwns.name },
        }));
        const ownerList = await cursorOwnerList.all();
        mergeObjectList(packageSubList, ownerList, '_id');
      }
      // Previous
      if (includeList && (includeList as string[]).includes('previous')) {
        const cursorPreviousList = await trx.step(() => db.query({
          query: `
            FOR id IN @packageIdList
              FOR previous IN OUTBOUND id @@collectionSucceeds
                RETURN { _id: id, previous: previous._id }
          `,
          bindVars: { packageIdList, '@collectionSucceeds': collectionSucceeds.name },
        }))
        const previousList = await cursorPreviousList.all();
        mergeObjectList(packageSubList, previousList, '_id');
      }
      await trx.commit();
      return res.json(packageSubList);
    } catch (e) {
      if (trx) {
        await trx.abort();
      }
      console.error(e);
      return res.status(500).end();
    }
  });

  app.get('/packages/sub/:seqVal', async (req, res) => {
    const user = req.user as DocUser;
    if (!user) {
      return res.status(403).end();
    }
    let trx: Transaction | undefined;
    try {
      const collectionPackageSub = db.collection(COLLECTION_PACKAGE_SUB);
      trx = await db.beginTransaction({
        read: [collectionPackageSub],
      });
      const { seqVal } = req.params;
      const _id = `${collectionPackageSub.name}/${seqVal}`;
      const packageSub = await trx.step(() => collectionPackageSub.document(_id));
      if (!packageSub) {
        await trx.abort();
        return res.status(404).end();
      }
      return res.json(packageSub);
    } catch (e) {
      if (trx) {
        await trx.abort();
      }
      console.error(e);
      return res.status(500).end();
    }
  });

  app.get('/packages', async (req, res) => {
    const user = req.user as DocUser;
    if(!user) {
      return res.status(403).end();
    }
    const { name: nameList, operator: operatorList, include: includeList } = req.query;
    if (nameList && !validateStringList(nameList)) {
      return res.status(400).end();
    }
    if (operatorList && !validateStringList(operatorList)) {
      return res.status(400).end();
    }
    if (includeList && !validateStringList(includeList)) {
      return res.status(400).end();
    }
    let trx: Transaction | undefined;
    try {
      const collectionDerivedFrom = db.collection(EDGE_COLLECTION_DERIVED_FROM);
      const collectionOperator = db.collection(COLLECTION_OPERATOR);
      const collectionOwns = db.collection(EDGE_COLLECTION_OWNS);
      const collectionPackageMain = db.collection(COLLECTION_PACKAGE_MAIN);
      const collectionPackageSub = db.collection(COLLECTION_PACKAGE_SUB);
      const collectionSucceeds = db.collection(EDGE_COLLECTION_SUCCEEDS);
      const collectionTargets = db.collection(EDGE_COLLECTION_TARGETS);
      const collectionUser = db.collection(COLLECTION_USER);
      trx = await db.beginTransaction({
        read: [collectionDerivedFrom, collectionPackageMain, collectionPackageSub, collectionOperator, collectionOwns, collectionTargets, collectionSucceeds, collectionUser],
      });
      const nameFilter = nameList && nameList.length ?
      'FILTER @nameList[** FILTER CONTAINS(UPPER(package.name), UPPER(CURRENT))].length > 0' : '';
      const bindVarsNameFilter = (nameList && nameList.length ? { nameList } : {}) as any;
      // Main packages
      const cursorPackageMainList = await trx.step(() => db.query({
        query: `
          FOR package IN @@collectionPackageMain
            ${nameFilter}
            RETURN package
        `,
        bindVars: { '@collectionPackageMain': collectionPackageMain.name, ...bindVarsNameFilter },
      }));
      const packageMainList = await cursorPackageMainList.all();
      // Sub packages
      const operatorFilter = operatorList && operatorList.length ?
        `
          FOR operator IN OUTBOUND package._id @@collectionTargets
            FILTER @operatorList[** FILTER CONTAINS(UPPER(operator.name), UPPER(CURRENT))].length > 0
        ` : '';
      const bindVarsOperatorFilter = (operatorList && operatorList.length ? { '@collectionTargets': collectionTargets.name, operatorList } : {}) as any;
      const cursorPackageSubList = await trx.step(() => db.query({
        query: `
          FOR package IN @@collectionPackageSub
            ${nameFilter}
            ${operatorFilter}
            FOR packageMain IN OUTBOUND package._id @@collectionDerivedFrom
              RETURN MERGE(package, { main: packageMain._id })
        `,
        bindVars: {
          '@collectionPackageSub': collectionPackageSub.name,
          ...bindVarsNameFilter, ...bindVarsOperatorFilter,
          '@collectionDerivedFrom': collectionDerivedFrom.name,
        },
      }));
      const packageSubList = await cursorPackageSubList.all();
      const packageIdList = packageSubList.map((packageSub) => packageSub._id);
      // Operator
      const cursorOperatorDocList = await trx.step(() => db.query({
        query: `
          FOR id IN @packageIdList
            FOR operator IN OUTBOUND id @@collectionTargets
              RETURN { _id: id, operator: operator._id }
        `,
        bindVars: { packageIdList, '@collectionTargets': collectionTargets.name },
      }));
      const operatorDocList = await cursorOperatorDocList.all();
      mergeObjectList(packageSubList, operatorDocList, '_id');
      // Owner
      if (includeList && (includeList as string[]).includes('owner')) {
        const cursorOwnerList = await trx.step(() => db.query({
          query: `
            FOR id IN @packageIdList
              FOR user IN INBOUND id @@collectionOwns
                RETURN { _id: id, owner: user._id }
          `,
          bindVars: { packageIdList, '@collectionOwns': collectionOwns.name },
        }));
        const ownerList = await cursorOwnerList.all();
        mergeObjectList(packageSubList, ownerList, '_id');
      }
      // Previous
      if (includeList && (includeList as string[]).includes('previous')) {
        const cursorPreviousList = await trx.step(() => db.query({
          query: `
            FOR id IN @packageIdList
              FOR previous IN OUTBOUND id @@collectionSucceeds
                RETURN { _id: id, previous: previous._id }
          `,
          bindVars: { packageIdList, '@collectionSucceeds': collectionSucceeds.name },
        }))
        const previousList = await cursorPreviousList.all();
        mergeObjectList(packageSubList, previousList, '_id');
      }
      await trx.commit();
      const packageList = [...packageMainList, ...packageSubList];
      return res.json(packageList);
    } catch (e) {
      if (trx) {
        await trx.abort();
      }
      console.error(e);
      return res.status(500).end();
    }
  });

  app.post('/packages', async (req, res) => {
    const user = req.user as DocUser;
    // TODO: Allow operator owner to create sub package
    if (!user || user.role !== 'admin') {
      return res.status(403).end();
    }
    const { name, sub } = req.body;
    if (!validateString(name)) {
      return res.status(400).end();
    }
    let trx: Transaction | undefined;
    try {
      const collectionDerivedFrom = db.collection(EDGE_COLLECTION_DERIVED_FROM);
      const collectionOperator = db.collection(COLLECTION_OPERATOR);
      const collectionOwns = db.collection(EDGE_COLLECTION_OWNS);
      const collectionPackageMain = db.collection(COLLECTION_PACKAGE_MAIN);
      const collectionPackageSub = db.collection(COLLECTION_PACKAGE_SUB);
      const collectionSucceeds = db.collection(EDGE_COLLECTION_SUCCEEDS);
      const collectionTargets = db.collection(EDGE_COLLECTION_TARGETS);
      const collectionUser = db.collection(COLLECTION_USER);
      trx = await db.beginTransaction({
        read: [collectionOperator, collectionUser],
        write: [collectionDerivedFrom, collectionPackageMain, collectionPackageSub, collectionOwns, collectionSucceeds, collectionTargets],
      });
      // Check duplicate package name
      const packageFound = await findPackageByName(db, trx, name);
      if (packageFound) {
        await trx.abort();
        return res.status(400).json({ reason: 'Duplicate package name'});
      }
      if (!sub) {
        // Create a main package
        await trx.step(() => collectionPackageMain.save({ name }));
        await trx.commit();
        return res.status(200).end();
      } else {
        const { main, operator, previous, owner } = sub;
        if (!validateString(main) || !validateString(operator) || !validateString(owner)
            || (previous && !validateString(previous))) {
          await trx.abort();
          return res.status(400).end();
        }
        // Create a sub package
        const packageSub = await trx.step(() => collectionPackageSub.save({ name }));
        // Sub -derivedFrom-> Main
        const packageMainFound = await trx.step(() => collectionPackageMain.document(main));
        if (!packageMainFound) {
          await trx.abort();
          return res.status(400).json({ reason: 'Main package not found' });
        }
        await trx.step(() => collectionDerivedFrom.save({
          _from: packageSub._id,
          _to: packageMainFound._id,
        }));
        // Sub -targets-> Operator
        const operatorFound = await trx.step(() => collectionOperator.document(operator));
        if (!operatorFound) {
          await trx.abort();
          return res.status(400).json({ reason: 'Operator not found' });
        }
        await trx.step(() => collectionTargets.save({
          _from: packageSub._id,
          _to: operatorFound._id,
        }));
        // User -owns-> Sub
        const ownerFound = await trx.step(() => collectionUser.document(owner));
        if (!ownerFound) {
          await trx.abort();
          return res.status(400).json({ reason: 'Owner not found' });
        }
        await trx.step(() => collectionOwns.save({
          _from: ownerFound._id,
          _to: packageSub._id,
        }));
        // Sub -succeeds-> Previous
        if (previous) {
          const previousFound = await trx.step(() => collectionPackageSub.document(previous));
          if (!previousFound) {
            await trx.abort();
            return res.status(400).json({ reason: 'Previous package not found' });
          }
          await trx.step(() => collectionSucceeds.save({
            _from: packageSub._id,
            _to: previousFound._id,
          }));
        }
        await trx.commit();
        return res.status(200).end();
      }
    } catch (e) {
      if (trx) {
        await trx.abort();
      }
      console.error(e);
      return res.status(500).end();
    }
  });
}

async function findPackageByName(db: Database, trx: Transaction, name: string) {
  const packageMain = await findPackageByNameInCollection(db, trx, name, COLLECTION_PACKAGE_MAIN);
  if (packageMain) {
    return packageMain;
  }
  const packageSub = await findPackageByNameInCollection(db, trx, name, COLLECTION_PACKAGE_SUB);
  if (packageSub) {
    return packageSub;
  }
  return undefined;
}

async function findPackageByNameInCollection(db: Database, trx: Transaction, name: string, collectionName: string) {
  const cursorPackageFound = await trx.step(() => db.query({
    query: `
      FOR package IN @@collectionPackage
        FILTER package.name == @name
        LIMIT 1
        RETURN package
    `,
    bindVars: { '@collectionPackage': collectionName, name },
  }));
  const packageFound = await cursorPackageFound.all();
  return packageFound[0];
}
