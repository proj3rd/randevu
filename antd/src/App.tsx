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
            <Route path='/operators' render={() => <Operators user={user} />} />
            <Route path='/packages' render={() => <Packages user={user} />} />
            <Route path='/deployment-options' render={() => <EnumManager title='Deployment options' path='/deployment-options' user={user} />} />
            <Route path='/duplex-modes' render={() => <EnumManager title='Duplex modes' path='/duplex-modes' user={user} />} />
            <Route path='/network-elements' render={() => <EnumManager title='Network elements' path='/network-elements' user={user} />} />
            <Route path='/products' render={() => <EnumManager title='Products' path='/products' user={user} />} />
            <Route path='/radio-access-technologies' render={() => <EnumManager title='Radio Access Technologies' path='/radio-access-technologies' user={user} />} />
            <Route path='/ran-sharing' render={() => <EnumManager title='RAN sharing' path='/ran-sharing' user={user} />} />
            <Route path='/regions' render={() => <Regions user={user} />} />
            <Route path='/join' render={() => <Join setWaiting={setWaiting} setUser={setUser} />} />
            <Route path='/login' render={() => <Login setWaiting={setWaiting} setUser={setUser} />} />
          </Switch>
        </Content>
      </Spin>
    </div>
  );
}

export default App;
