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
  // COLLECTION_USER,
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
  reset();
}

async function reset() {
  console.log('Resetting randevu...');
  const { db: dbConfig } = config;
  const db = new Database({
    url: `http://${dbConfig.host}:${dbConfig.port}`,
    databaseName: dbConfig.database,
    auth: { username: dbConfig.username, password: dbConfig.password },
  });
  const collectionMetaList = await db.listCollections();
  const docCollectionToResetNameList = filterCollectionNameList(docCollectionNameList, collectionMetaList);
  const edgeCollectionToResetList = filterCollectionNameList(edgeCollectionNameList, collectionMetaList);
  const collectionToResetList = [...docCollectionToResetNameList, ...edgeCollectionToResetList];
  for (let i = 0; i < collectionToResetList.length; i += 1) {
    const collectionName = collectionToResetList[i];
    const collection = db.collection(collectionName);
    await collection.truncate();
  }
  console.log('Done.');
}

function filterCollectionNameList(collectionNameList: string[], collectionMetaList: CollectionMetadata[]) {
  return collectionNameList.filter((collectionName) => {
    return collectionMetaList.find((collectionMeta) => collectionMeta.name === collectionName);
  });
}
