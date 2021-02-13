import { Database } from "arangojs";
import { Transaction } from "arangojs/transaction";
import { Express } from 'express';
import { COLLECTION_OPERATOR, COLLECTION_USER, EDGE_COLLECTION_OWNS } from "../constants";
import { User } from "randevu-shared/dist/types";
import { validateString } from "../utils";
import { findUserByName } from "./user";

export function serviceOperator(app: Express, db: Database) {
  app.get('/operators', async (req, res) => {
    const user = req.user as User;
    if(!user) {
      return res.status(403).end();
    }
    let trx: Transaction | undefined;
    try {
      const collectionOperator = db.collection(COLLECTION_OPERATOR);
      const collectionOwns = db.collection(EDGE_COLLECTION_OWNS);
      trx = await db.beginTransaction({
        read: [collectionOperator, collectionOwns],
      });
      const cursorOperatorWithOwnerList = await trx.step(() => db.query({
        query: `
          FOR operator in @@collectionOperator
            FOR owner IN INBOUND operator @@collectionOwns
            RETURN {
              operatorName: operator.operatorName,
              owner: owner.username
            }
        `,
        bindVars: {
          '@collectionOperator': collectionOperator.name,
          '@collectionOwns': collectionOwns.name,
        },
      }));
      const operatorWithOwnerList = await cursorOperatorWithOwnerList.all();
      await trx.commit();
      return res.json(operatorWithOwnerList);
    } catch (e) {
      if (trx) {
        await trx.abort();
      }
      console.error(e);
      return res.status(500).end();
    }
  });

  app.post('/operators', async (req, res) => {
    const user = req.user as User;
    if (!user || user.role !== 'admin') {
      return res.status(403).end();
    }
    const { operatorName, username } = req.body;
    if (!validateString(operatorName) || !validateString(username)) {
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
      const operatorExisting = await findOperatorByName(db, trx, operatorName);
      if (operatorExisting) {
        await trx.abort();
        return res.status(400).json({ reason: `Duplicate operator name` });
      }
      const operator = await trx.step(() => collectionOperator.save({ operatorName }));
      const userFound = await findUserByName(db, trx, username);
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

async function findOperatorByName(db: Database, trx: Transaction, operatorName: string) {
  const cursorOperatorFound = await trx.step(() => db.query({
    query: `
      FOR operator IN @@collectionOperator
        FILTER operator.operatorName == @operatorName
        LIMIT 1
        RETURN operator
    `,
    bindVars: { '@collectionOperator': COLLECTION_OPERATOR, operatorName },
  }));
  const operatorFound = await cursorOperatorFound.all();
  return operatorFound[0];
}
