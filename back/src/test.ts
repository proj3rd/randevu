import { Database } from "arangojs";
import { config } from "randevu-shared/dist/config";
import { install } from "./install";

if (require.main === module) {
  test();
}

async function test() {
  console.log('Installing randevu...');
  const { db: dbConfig } = config;
  const db = new Database({
    url: `http://${dbConfig.host}:${dbConfig.port}`,
    databaseName: dbConfig.database,
    auth: { username: dbConfig.username, password: dbConfig.password },
  });
  await install(db, true);
  describe('RANdevU test', function () {});
}
