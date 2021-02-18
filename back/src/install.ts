import { Database } from 'arangojs';
import { CollectionMetadata } from 'arangojs/collection';
import { config } from 'randevu-shared//dist/config';
import { COLLECTION_CUSTOMER, COLLECTION_DEPLOYMENT_OPTION, COLLECTION_FEATURE, COLLECTION_FEATURE_VERSION, COLLECTION_NETWORK_ELEMENT, COLLECTION_OPERATOR, COLLECTION_PACKAGE, COLLECTION_RADIO_ACCESS_TECH, COLLECTION_RAN_SHARING, COLLECTION_USER, EDGE_COLLECTION_SUCCEEDS, EDGE_COLLECTION_COMMITS, EDGE_COLLECTION_DERIVED_FROM, EDGE_COLLECTION_FORKED_FROM, EDGE_COLLECTION_IMPLEMENTS, EDGE_COLLECTION_OWNS, EDGE_COLLECTION_REGISTERS, EDGE_COLLECTION_REQUIRES, EDGE_COLLECTION_TARGETS, COLLECTION_CHANGE, EDGE_COLLECTION_DESCRIBES } from './constants';

const docCollectionNameList = [
  COLLECTION_CHANGE,
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
  EDGE_COLLECTION_TARGETS
];

if (require.main === module) {
  install();
}

async function install() {
  console.log('Installing randevu...');
  const { db: dbConfig } = config;
  const db = new Database({
    url: `http://${dbConfig.host}:${dbConfig.port}`,
    databaseName: dbConfig.database,
    auth: { username: dbConfig.username, password: dbConfig.password },
  });
  const collectionMetaList = await db.listCollections();
  const docCollectionToAddNameList = filterCollectionNameList(docCollectionNameList, collectionMetaList);
  await batchCreateCollection(db, docCollectionToAddNameList);
  const edgeCollectionToAddList = filterCollectionNameList(edgeCollectionNameList, collectionMetaList);
  await batchCreateCollection(db, edgeCollectionToAddList, true);
  console.log('Done.');
}

function filterCollectionNameList(collectionNameList: string[], collectionMetaList: CollectionMetadata[]) {
  return collectionNameList.filter((collectionName) => {
    return !collectionMetaList.find((collectionMeta) => collectionMeta.name === collectionName);
  });
}

async function batchCreateCollection(db: Database, collectionNameList: string[], edge?: boolean) {
  for (let i = 0; i < collectionNameList.length; i += 1) {
    const collectionName = collectionNameList[i];
    if (edge) {
      await db.createEdgeCollection(collectionName);
    } else {
      await db.createCollection(collectionName);
    }
  }
}
