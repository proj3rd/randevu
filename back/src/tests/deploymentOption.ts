import axios from "axios";

it('Should pass adding deployment options', function(done) {
  axios.post('/deployment-options', {
    name: 'LTE',
  }).then(() => {
    return axios.post('/deployment-options', {
      name: 'EN-DC',
    });
  }).then(() => {
    return axios.post('/deployment-options', {
      name: 'SA',
    });
  }).then(() => {
    return axios.post('/deployment-options', {
      name: 'NR-DC',
    });
  }).then(() => {
    done();
  }).catch((reason) => {
    done(reason);
  });
});

it('Should fail adding a duplicate deployment option', function(done) {
  axios.post('/deployment-options', { name: 'LTE' }).then(() => {
    done(new Error());
  }).catch((reason) => {
    done();
  });
});
