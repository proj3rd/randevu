import { Database } from 'arangojs';
import cors from 'cors';
import express from 'express';
import { config } from 'randevu-shared/dist/config';
import { serviceFeature } from './services/feature';
import { serviceOperator } from './services/operator';
import { serviceUser } from './services/user';

if (require.main === module) {
  const { api, db: dbConfig } = config;
  const db = new Database({
    url: `http://${dbConfig.host}:${dbConfig.port}`,
    databaseName: dbConfig.database,
    auth: { username: dbConfig.username, password: dbConfig.password },
  });
  const app = express();
  const allowedCrossOriginList = [
    'http://localhost:3000',
  ];
  app.use(cors({
    origin: allowedCrossOriginList,
    credentials: true,
  }));
  app.use(express.json());
  serviceUser(app, db);
  serviceFeature(app, db);
  serviceOperator(app, db);
  app.listen(api.port, api.host, () => {
    console.log(`randevu-backend listening on ${api.port}...`);
  });
}
