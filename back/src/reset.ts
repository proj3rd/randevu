import { Database } from "arangojs";
import { config } from "randevu-shared//dist/config";
import {
  COLLECTION_CUSTOMER,
  COLLECTION_DEPLOYMENT_OPTION,
  COLLECTION_FEATURE,
  COLLECTION_FEATURE_VERSION,
  COLLECTION_NETWORK_ELEMENT,
  COLLECTION_OPERATOR,
  COLLECTION_PACKAGE,
  COLLECTION_RADIO_ACCESS_TECH,
  COLLECTION_RAN_SHARING,
  COLLECTION_USER,
  EDGE_COLLECTION_SUCCEEDS,
  EDGE_COLLECTION_COMMITS,
  EDGE_COLLECTION_DERIVED_FROM,
  EDGE_COLLECTION_FORKED_FROM,
  EDGE_COLLECTION_IMPLEMENTS,
  EDGE_COLLECTION_OWNS,
  EDGE_COLLECTION_REGISTERS,
  EDGE_COLLECTION_REQUIRES,
  EDGE_COLLECTION_TARGETS,
  COLLECTION_CHANGE,
  EDGE_COLLECTION_DESCRIBES,
  COLLECTION_DUPLEX_MODE,
} from "./constants";
import { batchCreateCollection } from "./install";

const docCollectionNameList = [
  COLLECTION_CHANGE,
  COLLECTION_CUSTOMER,
  COLLECTION_DEPLOYMENT_OPTION,
  COLLECTION_DUPLEX_MODE,
  COLLECTION_FEATURE,
  COLLECTION_FEATURE_VERSION,
  COLLECTION_NETWORK_ELEMENT,
  COLLECTION_OPERATOR,
  COLLECTION_PACKAGE,
  COLLECTION_RADIO_ACCESS_TECH,
  COLLECTION_RAN_SHARING,
  COLLECTION_USER,
];

const edgeCollectionNameList = [
  EDGE_COLLECTION_COMMITS,
  EDGE_COLLECTION_DERIVED_FROM,
  EDGE_COLLECTION_DESCRIBES,
  EDGE_COLLECTION_FORKED_FROM,
  EDGE_COLLECTION_IMPLEMENTS,
  EDGE_COLLECTION_OWNS,
  EDGE_COLLECTION_REGISTERS,
  EDGE_COLLECTION_REQUIRES,
  EDGE_COLLECTION_SUCCEEDS,
  EDGE_COLLECTION_TARGETS,
];

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
