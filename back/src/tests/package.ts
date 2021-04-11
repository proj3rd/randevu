import axios from 'axios';
import { statusCode } from './utils';

it('Should fail adding a main package without name', function(done) {
  axios.post('/packages', {}).then(() => {
    done(new Error());
  }).catch((reason) => {
    if (reason && statusCode(reason.response) === 400) {
      done();
    } else {
      done(reason);
    }
  });
});

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

it('Should fail adding a sub package without name', function(done) {
  axios.post('/packages', {
    sub: {
      main: 'Document key of main package',
      operator: 'Document key of operator',
      owner: 'Document key of user',
    },
  }).then(() => {
    done(new Error());
  }).catch((reason) => {
    if (reason && statusCode(reason.response) === 400) {
      done();
    } else {
      done(reason);
    }
  })
});

it('Should fail adding a sub package without main package', function(done) {
  axios.post('/packages', {
    name: 'Sub package A',
    sub: {
      operator: 'Document key of operator',
      owner: 'Document key of user',
    },
  }).then(() => {
    done(new Error());
  }).catch((reason) => {
    if (reason && statusCode(reason.response) === 400) {
      done();
    } else {
      done(reason);
    }
  })
});

it('Should fail adding a sub package without operator', function(done) {
  axios.post('/packages', {
    name: 'Sub package A',
    sub: {
      main: 'Document key of main package',
      owner: 'Document key of user',
    },
  }).then(() => {
    done(new Error());
  }).catch((reason) => {
    if (reason && statusCode(reason.response) === 400) {
      done();
    } else {
      done(reason);
    }
  })
});

it('Should fail adding a sub package without owner', function(done) {
  axios.post('/packages', {
    name: 'Sub package A',
    sub: {
      main: 'Document key of main package',
      operator: 'Document key of operator',
    },
  }).then(() => {
    done(new Error());
  }).catch((reason) => {
    if (reason && statusCode(reason.response) === 400) {
      done();
    } else {
      done(reason);
    }
  })
});

it('Should pass adding a sub package', function(done) {
  let pkg: any;
  let operator: any;
  let owner: any;

  axios.get('/packages').then((value) => {
    const { data: packageList } = value;
    const packageFound = packageList.find((pkg: any) => pkg.name === 'Main package A');
    if (!packageFound) {
      throw new Error('Package not found');
    }
    pkg = packageFound;
    return axios.get('/operators');
  }).then((value) => {
    const { data: operatorList } = value;
    const operatorFound = operatorList.find((operator: any) => operator.name === 'Verizon Wireless');
    if (!operatorFound) {
      throw new Error('Operator not found');
    }
    operator = operatorFound;
    return axios.get('/users');
  }).then((value) => {
    const { data: userList } = value;
    const userFound = userList.find((user: any) => user.username === 'sjeon');
    if (!userFound) {
      throw new Error('User not found');
    }
    owner = userFound;
    return axios.post('/packages', {
      name: 'Sub package A',
      sub: {
        main: pkg._id,
        operator: operator._id,
        owner: owner._id,
      },
    });
  }).then(() => {
    done();
  }).catch((reason) => {
    done(reason);
  });
});


it('Should fail adding a duplicate sub package', function(done) {
  let pkg: any;
  let operator: any;
  let owner: any;

  axios.get('/packages').then((value) => {
    const { data: packageList } = value;
    const packageFound = packageList.find((pkg: any) => pkg.name === 'Main package A');
    if (!packageFound) {
      throw new Error('Package not found');
    }
    pkg = packageFound;
    return axios.get('/operators');
  }).then((value) => {
    const { data: operatorList } = value;
    const operatorFound = operatorList.find((operator: any) => operator.name === 'Verizon Wireless');
    if (!operatorFound) {
      throw new Error('Operator not found');
    }
    operator = operatorFound;
    return axios.get('/users');
  }).then((value) => {
    const { data: userList } = value;
    const userFound = userList.find((user: any) => user.username === 'sjeon');
    if (!userFound) {
      throw new Error('User not found');
    }
    owner = userFound;
    return axios.post('/packages', {
      name: 'Sub package A',
      sub: {
        main: pkg._id,
        operator: operator._id,
        owner: owner._id,
      },
    });
  }).then(() => {
    done(new Error());
  }).catch((reason) => {
    if (reason && statusCode(reason.response) === 400
        && reason.response.data && reason.response.data.reason
        && reason.response.data.reason === 'Duplicate package name') {
      done();
    } else {
      console.log(reason);
      done(reason);
    }
  });
});