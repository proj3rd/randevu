import { Database } from 'arangojs';
import express from 'express';
import { config } from './config';
import { serviceUser } from './services/user';

if (require.main === module) {
  const { api, db: dbConfig } = config;
  const db = new Database({
    url: `http://${dbConfig.host}:${dbConfig.port}`,
    databaseName: dbConfig.database,
    auth: { username: dbConfig.username, password: dbConfig.password },
  });
  const app = express();
  app.use(express.json());
  serviceUser(app, db);
  app.listen(api.port, api.host, () => {
    console.log(`randevu-backend listening on ${api.port}...`);
  });
}
