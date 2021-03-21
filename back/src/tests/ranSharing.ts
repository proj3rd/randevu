import axios from 'axios';

it('Should pass adding RAN sharing options', function(done) {
  axios.post('/ran-sharing', { name: 'MOCN' }).then(() => {
    return axios.post('/ran-sharing', { name: 'MORAN' });
  }).then(() => {
    done();
  }).catch((reason) => {
    done(reason);
  });
});

it('Should fail adding a duplicate RAN sharing option', function(done) {
  axios.post('/ran-sharing', { name: 'MOCN' }).then(() => {
    done(new Error());
  }).catch((reason) => {
    done();
  });
});
