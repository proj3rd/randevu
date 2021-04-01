import axios from 'axios';

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
