import axios from 'axios';

it('Should pass adding radio access technologies', function(done) {
  axios.post('/radio-access-technologies', {
    name: 'E-UTRA',
  }).then(() => {
    return axios.post('/radio-access-technologies', {
      name: 'NR',
    });
  }).then(() => {
    done();
  }).catch((reason) => {
    done(reason);
  });
});

it('Should fail adding a duplicate radio access technology', function(done) {
  axios.post('/radio-access-technologies', { name: 'NR' }).then(() => {
    done(new Error());
  }).catch((reason) => {
    done();
  });
});
