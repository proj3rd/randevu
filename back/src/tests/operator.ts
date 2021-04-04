import axios from "axios";

it('Should pass adding operators', function(done) {
  axios.get('/users/username/sjeon').then((value) => {
    return value.data._key;
  }).then((owner: string) => {
      axios.post('/operators', {
        name: 'Verizon Wireless',
        owner,
      }).then(() => {
        return axios.post('/operators', {
          name: 'AT&T Mobility',
          owner,
        });
      }).then(() => {
        return axios.post('/operators', {
          name: 'T-Mobile',
          owner,
        });
      }).then(() => {
        done();
      }).catch((reason) => {
        done(reason);
      });
  }).catch((reason) => {
    done(reason);
  });
});

it('Should fail adding a duplicate operator', function(done) {
  axios.get('/users/username/sjeon').then((value) => {
    return value.data._key;
  }).then((owner: string) => {
    axios.post('/operators', {
      name: 'Verizon Wireless',
      owner,
    }).then(() => {
      done(new Error());
    }).catch((reason) => {
      done();
    });
  }).catch((reason) => {
    done(reason);
  });
});

it('Should pass getting information of an operator', function(done) {
  axios.get('/operators/name/Verizon Wireless').then((value) => {
    const { name } = value.data;
    done(name !== 'Verizon Wireless');
  }).catch((reason) => {
    done(reason);
  });
});
