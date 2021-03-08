import { Database } from 'arangojs';
import { CollectionMetadata } from 'arangojs/collection';
import { config } from 'randevu-shared//dist/config';
import { docCollectionNameList, edgeCollectionNameList } from './constants';

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

export async function batchCreateCollection(db: Database, collectionNameList: string[], edge?: boolean) {
  for (let i = 0; i < collectionNameList.length; i += 1) {
    const collectionName = collectionNameList[i];
    if (edge) {
      await db.createEdgeCollection(collectionName);
    } else {
      await db.createCollection(collectionName);
    }
  }
}
