import axios from 'axios';

it('Should pass adding network elements', function(done) {
  axios.post('/network-elements', {
    name: 'eNB',
  }).then(() => {
    return axios.post('/network-elements', {
      name: 'gNB',
    });
  }).then(() => {
    done();
  }).catch((reason) => {
    done(reason);
  });
});

it('Should fail adding a duplicate network element', function(done) {
  axios.post('/network-elements', { name: 'gNB' }).then(() => {
    done(new Error());
  }).catch((reason) => {
    done();
  });
});
