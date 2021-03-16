import { Database } from 'arangojs';
import { CollectionMetadata } from 'arangojs/collection';
import { program } from 'commander';
import { config } from 'randevu-shared//dist/config';
import { docCollectionNameList, edgeCollectionNameList } from './constants';

if (require.main === module) {
  program.option('-r, --reset', 'Reset. drop all collections before installing');
  program.parse(process.argv);
  const options = program.opts();
  console.log('Installing randevu...');
  const { db: dbConfig } = config;
  const db = new Database({
    url: `http://${dbConfig.host}:${dbConfig.port}`,
    databaseName: dbConfig.database,
    auth: { username: dbConfig.username, password: dbConfig.password },
  });
  install(db, options.reset).then(() => {
    console.log('Done.');
  });
}

export async function install(db: Database, reset: boolean) {
  if (reset) {
    const collectionList = await db.collections();
    for (let i = 0; i < collectionList.length; i += 1) {
      await collectionList[i].drop();
    }
  }
  const collectionMetaList = await db.listCollections();
  const docCollectionToAddNameList = filterCollectionNameList(docCollectionNameList, collectionMetaList);
  await batchCreateCollection(db, docCollectionToAddNameList);
  const edgeCollectionToAddList = filterCollectionNameList(edgeCollectionNameList, collectionMetaList);
  await batchCreateCollection(db, edgeCollectionToAddList, true);
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
