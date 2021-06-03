import './App.css';
import { Col, Row, Spin } from "antd";
import { config } from 'randevu-shared/dist/config';
import { DocUser } from 'randevu-shared/dist/types';
import { Route, Switch, useHistory } from 'react-router-dom';
import { Content } from 'antd/lib/layout/layout';
import { useEffect, useState } from 'react';
import axios from 'axios';
import Join from './routes/join';
import Login from './routes/login';
import EnumManager from './routes/enumManager';
import Operators from './routes/operators';
import AppMenu from './components/appMenu';
import Packages from './routes/packages';
import Regions from './routes/regions';

const { api } = config;
const { host, port } = api;
axios.defaults.baseURL = `http://${host}:${port}`;
axios.defaults.withCredentials = true;

function App() {
  const history = useHistory();

  const [waiting, setWaiting] = useState(false);
  const [user, setUser] = useState<DocUser | undefined>(undefined);

  useEffect(() => {
    setWaiting(true);
    axios.get('/authenticate').then((response) => {
      const { data: user } = response;
      setUser(user);
    }).catch((reason) => {
      console.error(reason);
    }).finally(() => {
      setWaiting(false);
    });
  }, []);

  function onClickLogout() {
    setWaiting(true);
    axios.get('/logout').then((response) => {
      setUser(undefined);
      history.push('/');
    }).catch((reason) => {
      console.error(reason);
    }).finally(() => {
      setWaiting(false);
    })
  }

  const setStateActionsToChild = { setUser, setWaiting };
  const propsToChild = { user, ...setStateActionsToChild };

  return (
    <div className="App">
      <Spin spinning={waiting}>
        <Row >
          <Col span={24}>
            <AppMenu user={user} onClickLogout={onClickLogout} />
          </Col>
        </Row>
        <Content style={{ padding: '1em' }}>
          <Switch>
            <Route exact path='/'>
              Landing
            </Route>
            <Route path='/operators' render={() => <Operators {...propsToChild} />} />
            <Route path='/packages' render={() => <Packages {...propsToChild} />} />
            <Route path='/deployment-options' render={() => <EnumManager title='Deployment options' path='/deployment-options' {...propsToChild} />} />
            <Route path='/duplex-modes' render={() => <EnumManager title='Duplex modes' path='/duplex-modes' {...propsToChild} />} />
            <Route path='/network-elements' render={() => <EnumManager title='Network elements' path='/network-elements' {...propsToChild} />} />
            <Route path='/products' render={() => <EnumManager title='Products' path='/products' {...propsToChild} />} />
            <Route path='/radio-access-technologies' render={() => <EnumManager title='Radio Access Technologies' path='/radio-access-technologies' {...propsToChild} />} />
            <Route path='/ran-sharing' render={() => <EnumManager title='RAN sharing' path='/ran-sharing' {...propsToChild} />} />
            <Route path='/regions' render={() => <Regions {...propsToChild} />} />
            <Route path='/join' render={() => <Join {...setStateActionsToChild} />} />
            <Route path='/login' render={() => <Login {...setStateActionsToChild} />} />
          </Switch>
        </Content>
      </Spin>
    </div>
  );
}

export default App;
