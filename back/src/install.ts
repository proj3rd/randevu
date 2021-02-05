import { Database } from 'arangojs';
import { CollectionMetadata } from 'arangojs/collection';
import { config } from './config';
import { COLLECTION_CUSTOMER, COLLECTION_FEATURE, COLLECTION_FEATURE_VERSION, COLLECTION_PACKAGE_MAIN, COLLECTION_PACKAGE_SUB, COLLECTION_USER, EDGE_COLECTION_SUCCEEDS, EDGE_COLLECTION_COMMITS, EDGE_COLLECTION_DERIVED_FROM, EDGE_COLLECTION_FORKED_FROM, EDGE_COLLECTION_IMPLEMENTS, EDGE_COLLECTION_OWNS, EDGE_COLLECTION_REGISTERS, EDGE_COLLECTION_REQUIRES, EDGE_COLLECTION_TARGETS } from './constants';

const docCollectionNameList = [
  COLLECTION_CUSTOMER,
  COLLECTION_FEATURE,
  COLLECTION_FEATURE_VERSION,
  COLLECTION_PACKAGE_MAIN,
  COLLECTION_PACKAGE_SUB,
  COLLECTION_USER,
];

const edgeCollectionNameList = [
  EDGE_COLLECTION_COMMITS,
  EDGE_COLLECTION_DERIVED_FROM,
  EDGE_COLLECTION_FORKED_FROM,
  EDGE_COLLECTION_IMPLEMENTS,
  EDGE_COLLECTION_OWNS,
  EDGE_COLLECTION_REGISTERS,
  EDGE_COLLECTION_REQUIRES,
  EDGE_COLECTION_SUCCEEDS,
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
