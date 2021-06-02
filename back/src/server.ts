import { Database } from 'arangojs';
import cors from 'cors';
import express from 'express';
import { config } from 'randevu-shared/dist/config';
import { serviceDeploymentOption } from './services/deploymentOption';
import { serviceDuplexMode } from './services/duplexMode';
import { serviceFeature } from './services/feature';
import { serviceNetworkElement } from './services/networkElement';
import { serviceOperator } from './services/operator';
import { servicePackage } from './services/package';
import { serviceProduct } from './services/product';
import { serviceRadioAccessTech } from './services/radioAccessTechnology';
import { serviceRanSharing } from './services/ranSharing';
import { serviceRegion } from './services/region';
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
  serviceDeploymentOption(app, db);
  serviceDuplexMode(app, db);
  serviceFeature(app, db);
  serviceNetworkElement(app, db);
  serviceOperator(app, db);
  servicePackage(app, db);
  serviceProduct(app, db);
  serviceRadioAccessTech(app, db);
  serviceRanSharing(app, db);
  serviceRegion(app, db);
  app.listen(api.port, api.host, () => {
    console.log(`randevu-backend listening on ${api.port}...`);
  });
}
