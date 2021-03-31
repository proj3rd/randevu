import axios from "axios";

it('Should pass adding products', function(done) {
  axios.post('/products', {
    name: 'CPF (VM)',
  }).then(() => {
    return axios.post('/products', {
      name: 'CPF (Container)',
    });
  }).then(() => {
    return axios.post('/products', {
      name: 'UPF (VM) (',
    });
  }).then(() => {
    return axios.post('/products', {
      name: 'UPF (Container)',
    });
  }).then(() => {
    done();
  }).catch((reason) => {
    done(reason);
  });
});

it('Should fail adding a duplicate product', function(done) {
  axios.post('/products', { name: 'CPF (VM)' }).then(() => {
    done(new Error());
  }).catch((reason) => {
    done();
  });
});
