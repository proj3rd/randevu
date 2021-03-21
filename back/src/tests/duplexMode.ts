import axios from "axios";

it('Should pass adding duplex modes', function(done) {
  axios.post('/duplex-modes', {
    name: 'FDD',
  }).then(() => {
    return axios.post('/duplex-modes', {
      name: 'TDD',
    });
  }).then(() => {
    return axios.post('/duplex-modes', {
      name: 'SDL',
    });
  }).then(() => {
    return axios.post('/duplex-modes', {
      name: 'SUL',
    });
  }).then(() => {
    done();
  }).catch((reason) => {
    done(reason);
  });
});

it('Should fail adding a duplicate duplex mode', function(done) {
  axios.post('/duplex-modes', { name: 'FDD' }).then(() => {
    done(new Error());
  }).catch((reason) => {
    done();
  });
});
