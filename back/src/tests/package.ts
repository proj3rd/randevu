import axios from 'axios';
import { statusCode } from './utils';

it('Should fail adding a main package without name', function(done) {
  axios.post('/packages', {}).then(() => {
    done(new Error());
  }).catch((reason) => {
    if (reason && statusCode(reason.response) === 400) {
      done();
    } else {
      done(reason);
    }
  });
});

it('Should pass adding a main package', function(done) {
  axios.post('/packages', { name: 'Main package A' }).then(() => {
    done();
  }).catch((reason) => {
    done(reason);
  });
});


it('Should fail adding a duplicate package', function(done) {
  axios.post('/packages', { name: 'Main package A' }).then(() => {
    done(new Error());
  }).catch(() => {
    done();
  });
});

it('Should fail adding a sub package without name', function(done) {
  axios.post('/packages', {
    sub: {
      main: 'Document ID of main package',
      operator: 'Document ID of operator',
      owner: 'Document ID of user',
    },
  }).then(() => {
    done(new Error());
  }).catch((reason) => {
    if (reason && statusCode(reason.response) === 400) {
      done();
    } else {
      done(reason);
    }
  })
});

it('Should fail adding a sub package without main package', function(done) {
  axios.post('/packages', {
    name: 'Sub package A',
    sub: {
      operator: 'Document ID of operator',
      owner: 'Document ID of user',
    },
  }).then(() => {
    done(new Error());
  }).catch((reason) => {
    if (reason && statusCode(reason.response) === 400) {
      done();
    } else {
      done(reason);
    }
  })
});
