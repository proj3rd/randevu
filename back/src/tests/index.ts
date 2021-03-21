import { Database } from "arangojs";
import axios from 'axios';
import { config } from "randevu-shared/dist/config";
import { COLLECTION_USER } from "../constants";
import { install } from "../install";

describe('RANdevU test', function() {
  let db: Database;
  let headers: { cookie?: any } = {};

  before(async function() {
    console.log('Resetting DB...');
    const { api, db: dbConfig } = config;
    db = new Database({
      url: `http://${dbConfig.host}:${dbConfig.port}`,
      databaseName: dbConfig.database,
      auth: { username: dbConfig.username, password: dbConfig.password },
    });
    await install(db, true);
    console.log('Done');
    axios.defaults.baseURL = `http://${api.host}:${api.port}`;
    axios.defaults.headers = headers;
  });

  it('Should fail logging in with invalid user credential', function(done) {
    axios.post('/login', {
      username: 'sjeon', password: 'asdf',
    }).then(() => {
      done(new Error());
    }).catch((reason) => {
      done();
    });
  });

  it('Should fail authenticating before logging in', function(done) {
    axios.get('/authenticate').then(() => {
      done(new Error());
    }).catch((reason) => {
      done();
    });
  });

  it('Should fail joining with invalid input (missing all)', function(done) {
    axios.post('/join').then(() => {
      done(new Error());
    }).catch((reason) => {
      done();
    });
  });

  it('Should fail joining with invalid input (missing username)', function(done) {
    axios.post('/join', {
      password: 'asdf',
    }).then(() => {
      done(new Error());
    }).catch((reason) => {
      done();
    });
  });

  it('Should fail joining with invalid input (missing password)', function(done) {
    axios.post('/join', {
      username: 'sjeon',
    }).then(() => {
      done(new Error());
    }).catch((reason) => {
      done();
    });
  });

  it('Should pass joining', function(done) {
    axios.post('/join', {
      username: 'sjeon', password: 'asdf',
    }).then(() => {
      done();
    }).catch((reason) => {
      done(reason);
    });
  });

  it('Should pass logging in', function(done) {
    axios.post('/login', {
      username: 'sjeon', password: 'asdf',
    }).then((value) => {
      headers.cookie = value.headers['set-cookie'];
      done();
    }).catch((reason) => {
      done(reason);
    });
  });

  it('Should pass authenticating', function(done) {
    axios.get('/authenticate').then(() => {
      done();
    }).catch((reason) => {
      done(reason);
    });
  });

  it('Should pass getting a list of users', function(done) {
    axios.get('/users/').then(async (value) => {
      const userList = value.data;
      if (userList.length !== 1) {
        done('Only 1 user should exist');
      }
      const { _id } = userList[0];
      const collectionUser = db.collection(COLLECTION_USER);
      await collectionUser.update(_id, { role: 'admin'});
      done();
    }).catch((reason) => {
      done(reason);
    })
  });

  require('./duplexMode');
  require('./networkElement');
  require('./operator');
  require('./radioAccessTechnology');
  require('./ranSharing');

  it('Should pass adding a main package', function(done) {
    axios.post('/packages', { name: 'Main package A' }).then(() => {
      done();
    }).catch((reason) => {
      done(reason);
    });
  });

  it('Should pass logging out', function(done) {
    axios.get('/logout').then(() => {
      delete headers.cookie;
      done();
    }).catch((reason) => {
      done(reason);
    })
  })
});
