import axios from "axios";

it('Should pass adding operators', function(done) {
  axios.get('/users/username/sjeon').then((value) => {
    return value.data._id;
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
    return value.data._id;
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
