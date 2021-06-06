import { Database } from "arangojs";
import { Transaction } from "arangojs/transaction";
import { Express } from 'express';
import { COLLECTION_OPERATOR, COLLECTION_PACKAGE_SUB, COLLECTION_USER, EDGE_COLLECTION_DERIVED_FROM, EDGE_COLLECTION_OWNS, EDGE_COLLECTION_SUCCEEDS, EDGE_COLLECTION_TARGETS } from "../constants";
import { DocOperator, DocUser } from "randevu-shared/dist/types";
import { mergeObjectList, validateString, validateStringList } from "../utils";

export function serviceOperator(app: Express, db: Database) {
  app.get('/operators', async (req, res) => {
    const user = req.user as DocUser;
    if(!user) {
      return res.status(403).end();
    }
    const { include, name, seqVal: seqValList } = req.query;
    if (include
        && (!(include instanceof Array)
            || include.some((item: any) => !validateString(item)))) {
      return res.status(400).end();
    }
    if (name && !validateString(name)) {
      return res.status(400).end();
    }
    if (seqValList && !validateStringList(seqValList)) {
      return res.status(400).end();
    }
    if (name && seqValList) {
      return res.status(400).end();
    }
    let trx: Transaction | undefined;
    try {
      const collectionOperator = db.collection(COLLECTION_OPERATOR);
      const collectionOwns = db.collection(EDGE_COLLECTION_OWNS);
      trx = await db.beginTransaction({
        read: [collectionOperator, collectionOwns],
      });
      const nameFilter = name ? 'FILTER CONTAINS(UPPER(operator.name), UPPER(@name))' : '';
      const bindVarsNameFilter = name ? { name } : {};
      const seqValListFilter = seqValList ? 'FILTER POSITION(@operatorIdList, operator._id)' : '';
      const operatorIdListForFilter = seqValList ? (seqValList as string[]).map((seqVal) => `${collectionOperator.name}/${seqVal}`) : [];
      const bindVarsSeqValListFilter = seqValList ? { operatorIdList: operatorIdListForFilter } : {};
      const cursorOperatorList = await trx.step(() =>
        db.query({
          query: `
          FOR operator IN @@collectionOperator
            ${nameFilter}
            ${seqValListFilter}
            RETURN operator
        `,
          bindVars: {
            "@collectionOperator": collectionOperator.name,
            ...bindVarsNameFilter,
            ...bindVarsSeqValListFilter,
          },
        })
      );
      const operatorList = (await cursorOperatorList.all()) as DocOperator[];
      const operatorIdList = operatorList.map((operator) => operator._id);
      if (include && (include as string[]).includes('owner')) {
        const cursorOwnerList = await trx.step(() => db.query({
          query: `
            FOR id IN @operatorIdList
              FOR user IN INBOUND id @@collectionOwns
                RETURN { _id: id, owner: user._id }
          `,
          bindVars: { operatorIdList, '@collectionOwns': collectionOwns.name },
        }));
        const ownerList = (await cursorOwnerList.all()) as DocUser[];
        mergeObjectList(operatorList, ownerList, '_id');
      }
      await trx.commit();
      return res.json(operatorList);
    } catch (e) {
      if (trx) {
        await trx.abort();
      }
      console.error(e);
      return res.status(500).end();
    }
  });

  app.post('/operators', async (req, res) => {
    const user = req.user as DocUser;
    if (!user || user.role !== 'admin') {
      return res.status(403).end();
    }
    const { name, owner } = req.body;
    if (!validateString(name) || !validateString(owner)) {
      return res.status(400).end();
    }
    let trx: Transaction | undefined;
    try {
      const collectionUser = db.collection(COLLECTION_USER);
      const collectionOperator = db.collection(COLLECTION_OPERATOR);
      const collectionOwns = db.collection(EDGE_COLLECTION_OWNS);
      trx = await db.beginTransaction({
        read: collectionUser,
        write: [collectionOperator, collectionOwns],
      });
      const operatorExisting = await findOperatorByName(db, trx, name);
      if (operatorExisting) {
        await trx.abort();
        return res.status(400).json({ reason: `Duplicate operator name` });
      }
      const operator = await trx.step(() => collectionOperator.save({ name }));
      const userFound = await collectionUser.document(owner);
      if (!userFound) {
        await trx.abort();
        return res.status(400).json({ reason: 'User not found' });
      }
      await trx.step(() => collectionOwns.save({
        _from: userFound._id,
        _to: operator._id,
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

  app.get('/operators/:seqVal', async (req, res) => {
    const user = req.user as DocUser;
    if (!user) {
      return res.status(403).end();
    }
    const { seqVal } = req.params;
    if (!seqVal || !validateString(seqVal)) {
      return res.status(400).end();
    }
    let trx: Transaction | undefined;
    const collectionOperator = db.collection(COLLECTION_OPERATOR);
    const operatorId = `${collectionOperator.name}/${seqVal}`;
    try {
      trx = await db.beginTransaction({
        read: [collectionOperator],
      });
      const existsOperator = await trx.step(() => collectionOperator.documentExists(operatorId));
      if (!existsOperator) {
        await trx.abort();
        return res.status(404).end();
      }
      const operator = await trx.step(() => collectionOperator.document(operatorId));
      await trx.commit();
      return res.json(operator);
    } catch (e) {
      console.error(e);
      if (trx) {
        await trx.abort();
      }
      return res.status(500).end();
    }
  });

  app.get('/operators/:seqVal/packages', async (req, res) => {
    const user = req.user as DocUser;
    if (!user) {
      return res.status(403).end();
    }
    const { seqVal } = req.params;
    const { include } = req.query;
    if (!validateString(seqVal)
        || (include && !validateStringList(include))
    ) {
      return res.status(400).end();
    }
    const includeList = include as unknown as string[];
    let trx: Transaction | undefined;
    const collectionDerivedFrom = db.collection(EDGE_COLLECTION_DERIVED_FROM);
    const collectionOperator = db.collection(COLLECTION_OPERATOR);
    const collectionPackageSub = db.collection(COLLECTION_PACKAGE_SUB);
    const collectionSucceeds = db.collection(EDGE_COLLECTION_SUCCEEDS);
    const collectionTargets = db.collection(EDGE_COLLECTION_TARGETS);
    const operator_id = `${collectionOperator.name}/${seqVal}`;
    try {
      trx = await db.beginTransaction({
        read: [collectionDerivedFrom, collectionOperator, collectionPackageSub, collectionSucceeds, collectionTargets],
      });
      const operatorExists = await trx.step(() => collectionOperator.documentExists(operator_id));
      if (!operatorExists) {
        await trx.abort();
        return res.status(400).json({ reason: 'Operator does not exist '});
      }
      const cursorPackageSubList = await trx.step(() =>  db.query({
        query: `
          WITH @@collectionPackageSub
          FOR packageSub IN INBOUND @operator_id @@collectionTargets
            RETURN packageSub
        `,
        bindVars: {
          '@collectionPackageSub': collectionPackageSub.name,
          operator_id,
          '@collectionTargets': collectionTargets.name,
        },
      }));
      const packageSubList = await cursorPackageSubList.all();
      const packageSubIdList = packageSubList.map((packageSub) => packageSub._id);
      if (includeList && includeList.includes('main')) {
        const cursorPackageMainList = await trx.step(() => db.query({
          query: `
            FOR packageSubId IN @packageSubIdList
              FOR packageMain IN OUTBOUND packageSubId @@collectionDerivedFrom
                RETURN {_id: packageSubId, main: packageMain._id}
          `,
          bindVars: {
            packageSubIdList,
            '@collectionDerivedFrom': collectionDerivedFrom.name,
          },
        }));
        const packageMainList = await cursorPackageMainList.all();
        mergeObjectList(packageSubList, packageMainList, '_id');
      }
      if (includeList && includeList.includes('previous')) {
        const cursorPackagePreviousList = await trx.step(() => db.query({
          query: `
            FOR packageSubId IN @packageSubIdList
              FOR packagePrevious IN OUTBOUND packageSubId @@collectionSucceeds
                RETURN {_id: packageSubId, previous: packagePrevious._id}
          `,
          bindVars: {
            packageSubIdList,
            '@collectionSucceeds': collectionSucceeds.name,
          },
        }));
        const packagePreviousList = await cursorPackagePreviousList.all();
        mergeObjectList(packageSubList, packagePreviousList, '_id');
      }
      await trx.commit();
      return res.json(packageSubList);
    } catch (e) {
      console.error(e);
      if (trx) {
        await trx.abort();
      }
      return res.status(500).end();
    }
  });
}

async function findOperatorByName(db: Database, trx: Transaction, name: string) {
  const cursorOperatorFound = await trx.step(() => db.query({
    query: `
      FOR operator IN @@collectionOperator
        FILTER operator.name == @name
        LIMIT 1
        RETURN operator
    `,
    bindVars: { '@collectionOperator': COLLECTION_OPERATOR, name },
  }));
  const operatorFound = await cursorOperatorFound.all();
  return operatorFound[0];
}
