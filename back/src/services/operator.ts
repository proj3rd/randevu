import { Database } from "arangojs";
import { Transaction } from "arangojs/transaction";
import { Express } from 'express';
import { COLLECTION_OPERATOR, COLLECTION_USER, EDGE_COLLECTION_OWNS } from "../constants";
import { DocOperator, DocUser } from "randevu-shared/dist/types";
import { mergeObjectList, validateString, validateStringList } from "../utils";

export function serviceOperator(app: Express, db: Database) {
  app.get('/operators', async (req, res) => {
    const user = req.user as DocUser;
    if(!user) {
      return res.status(403).end();
    }
    const { include } = req.query;
    if (include
        && (!(include instanceof Array)
            || include.some((item: any) => !validateString(item)))) {
      return res.status(400).end();
    }
    let trx: Transaction | undefined;
    try {
      const collectionOperator = db.collection(COLLECTION_OPERATOR);
      const collectionOwns = db.collection(EDGE_COLLECTION_OWNS);
      trx = await db.beginTransaction({
        read: [collectionOperator, collectionOwns],
      });
      const { name } = req.query;
      const nameFilter = name ? 'FILTER CONTAINS(UPPER(operator.name), UPPER(@name))' : '';
      const bindVarsNameFilter = name ? { name } : {};
      const cursorOperatorList = await trx.step(() => db.query({
        query: `
          FOR operator IN @@collectionOperator
            ${nameFilter}
            RETURN operator
        `,
        bindVars: { '@collectionOperator': collectionOperator.name, ...bindVarsNameFilter },
      }));
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
