import { Database } from "arangojs";
import { Transaction } from "arangojs/transaction";
import { Response } from "express";

export async function handleRequestAddEnum(
  res: Response,
  db: Database,
  collectionName: string,
  name: string
) {
  let trx: Transaction | undefined;
  try {
    let collection = db.collection(collectionName);
    trx = await db.beginTransaction({
      write: collection,
    });
    const cursorEnumFound = await trx.step(() =>
      db.query({
        query: `
        FOR enum IN @@collectionName
          FILTER enum.name == @name
          LIMIT 1
          RETURN enum
      `,
        bindVars: { "@collectionName": collection.name, name },
      })
    );
    const enum_ = (await cursorEnumFound.all())[0];
    if (enum_) {
      await trx.abort();
      return res.status(400).json({ reason: "Duplicate name" });
    }
    await trx.step(() => collection.save({ name }));
    await trx.commit();
    return res.status(200).end();
  } catch (e) {
    if (trx) {
      await trx.abort();
    }
    console.error(e);
    return res.status(500).end();
  }
}

export async function handleRequestGetEnumList(
  res: Response,
  db: Database,
  collectionName: string
) {
  let trx: Transaction | undefined;
  try {
    let collection = db.collection(collectionName);
    trx = await db.beginTransaction({
      read: collection,
    });
    const cursorEnumList = await trx.step(() =>
      db.query({
        query: `
        FOR enum IN @@collectionName
          RETURN enum.name
      `,
        bindVars: { "@collectionName": collection.name },
      })
    );
    const enumList = await cursorEnumList.all();
    await trx.commit();
    return res.json(enumList);
  } catch (e) {
    if (trx) {
      await trx.abort();
    }
    console.error(e);
    return res.status(500).end();
  }
}

export async function handleRequestRenameEnum(
  res: Response,
  db: Database,
  collectionName: string,
  name: string,
  nameNew: string
) {
  let trx: Transaction | undefined;
  try {
    let collection = db.collection(collectionName);
    trx = await db.beginTransaction({
      write: collection,
    });
    const cursorEnumFound = await trx.step(() =>
      db.query({
        query: `
        FOR enum IN @@collectionName
          FILTER enum.name == @name
          LIMIT 1
          UPDATE enum WITH { name: @nameNew } IN @@collectionName
          RETURN enum
      `,
        bindVars: { "@collectionName": collection.name, name, nameNew },
      })
    );
    const enum_ = (await cursorEnumFound.all())[0];
    if (!enum_) {
      await trx.abort();
      return res.status(404).json({ reason: "Name not found" });
    }
    await trx.commit();
    return res.status(200).end();
  } catch (e) {
    if (trx) {
      await trx.abort();
    }
    console.error(e);
    return res.status(500).end();
  }
}
