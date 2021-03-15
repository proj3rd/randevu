import { Database } from "arangojs";
import { Transaction } from "arangojs/transaction";
import { Express } from 'express';
import { COLLECTION_OPERATOR, COLLECTION_PACKAGE_MAIN, COLLECTION_PACKAGE_SUB, COLLECTION_USER, EDGE_COLLECTION_DERIVED_FROM, EDGE_COLLECTION_OWNS, EDGE_COLLECTION_SUCCEEDS, EDGE_COLLECTION_TARGETS } from "../constants";
import { User } from "randevu-shared/dist/types";
import { validateString, validateStringList } from "../utils";

export function servicePackage(app: Express, db: Database) {
  app.get('/packages', async (req, res) => {
    const user = req.user as User;
    if(!user) {
      return res.status(403).end();
    }
    const { name: nameList, operator: operatorList, include } = req.query;
    if (nameList && !validateStringList(nameList)) {
      return res.status(400).end();
    }
    if (operatorList && !validateStringList(operatorList)) {
      return res.status(400).end();
    }
    if (include && !validateStringList(include)) {
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
              RETURN { _id: package._id, name: package.name, main: packageMain }
        `,
        bindVars: {
          '@collectionPackageSub': collectionPackageSub.name,
          ...bindVarsNameFilter, ...bindVarsOperatorFilter,
          '@collectionDerivedFrom': collectionDerivedFrom.name,
        },
      }));
      const packageSubList = await cursorPackageSubList.all();
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
    const user = req.user as User;
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
      if (packageFound.length) {
        await trx.abort();
        return res.status(400).json({ reason: 'Duplicate package name '});
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
    bindVars: { '@collectionPackage': collectionName, username: name },
  }));
  const packageFound = await cursorPackageFound.all();
  return packageFound[0];
}
