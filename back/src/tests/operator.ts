import axios from "axios";

it('Should pass adding operators', function(done) {
  axios.get('/users/?username=sjeon').then((value) => {
    const { data: userList } = value;
    const userFound = userList.find((user: any) => user.username === 'sjeon');
    if (!userFound) {
      throw new Error('user not found');
    }
    return userFound._id;
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
  axios.get('/users/?username=sjeon').then((value) => {
    const { data: userList } = value;
    const userFound = userList.find((user: any) => user.username === 'sjeon');
    if (!userFound) {
      throw new Error('user not found');
    }
    return userFound._id;
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
  axios.get('/operators').then((value) => {
    const { data: operatorList } = value;
    if (operatorList.length !== 3) {
      done('3 operator should exist');
    }
    done();
  }).catch((reason) => {
    done(reason);
  });
});

it('Should return zero operator', function(done) {
  axios.get('/operators/?name=DISH').then((value) => {
    const { data: operatorList } = value;
    if (operatorList.length !== 0) {
      done('No operator should be returned');
    }
    done();
  }).catch((reason) => {
    done(reason);
  });
});

it('Should pass getting information of an operator', function(done) {
  axios.get('/operators/?name=zon Wire').then((value) => {
    const { data: operatorList } = value;
    const operatorFound = operatorList.find((operator: any) => operator.name === 'Verizon Wireless');
    if (!operatorFound) {
      done('operator not found');
    }
    done();
  }).catch((reason) => {
    done(reason);
  });
});
