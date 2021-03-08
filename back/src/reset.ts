import { Database } from "arangojs";
import { config } from "randevu-shared//dist/config";
import { docCollectionNameList, edgeCollectionNameList } from "./constants";
import { batchCreateCollection } from "./install";

if (require.main === module) {
  reset();
}

async function reset() {
  console.log("Resetting randevu...");
  const { db: dbConfig } = config;
  const db = new Database({
    url: `http://${dbConfig.host}:${dbConfig.port}`,
    databaseName: dbConfig.database,
    auth: { username: dbConfig.username, password: dbConfig.password },
  });
  const collectionList = await db.collections();
  for (let i = 0; i < collectionList.length; i += 1) {
    await collectionList[i].drop();
  }
  await batchCreateCollection(db, docCollectionNameList);
  await batchCreateCollection(db, edgeCollectionNameList, true);
  console.log("Done.");
}
