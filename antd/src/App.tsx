import './App.css';
import { Col, Menu, Row, Spin } from "antd";
import { config } from 'randevu-shared/dist/config';
import { DocUser } from 'randevu-shared/dist/types';
import { Link, Route, Switch, useHistory } from 'react-router-dom';
import { Content } from 'antd/lib/layout/layout';
import { useEffect, useState } from 'react';
import axios from 'axios';
import Join from './routes/join';
import Login from './routes/login';
import EnumManager from './routes/enumManager';
import { isAdmin } from 'randevu-shared/dist/utils';
import Operators from './routes/operators';

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
            <Menu mode='horizontal'>
              <Menu.Item>
                <Link to='/'>RANdevU</Link>
              </Menu.Item>
              <Menu.Item></Menu.Item>
              {/* <Menu.Item>Features</Menu.Item> */}
              <Menu.Item>
                <Link to='/operators'>Operators</Link>
              </Menu.Item>
              {/* <Menu.Item>Packages</Menu.Item> */}
              {/* <Menu.Item>Requirements</Menu.Item> */}
              <Menu.SubMenu title='Collections'>
                <Menu.Item>
                  <Link to='/deployment-options'>Deployment options</Link>
                  </Menu.Item>
                <Menu.Item>
                  <Link to='/duplex-modes'>Duplex modes</Link>
                </Menu.Item>
                <Menu.Item>
                  <Link to='/network-elements'>Network elements</Link>
                </Menu.Item>
                <Menu.Item>
                  <Link to='/products'>Products</Link>
                </Menu.Item>
                <Menu.Item>
                  <Link to='/ran-sharing'>RAN sharing</Link>
                </Menu.Item>
              </Menu.SubMenu>
              <Menu.Item></Menu.Item>
              {
                isAdmin(user) ? (
                  <Menu.Item>Admin</Menu.Item>
                ) : (<></>)
              }
              {
                user ? (
                  <Menu.Item onClick={onClickLogout}>Logout</Menu.Item>
                ) : (
                  <>
                    <Menu.Item>
                      <Link to='/login'>Login</Link>
                    </Menu.Item>
                    <Menu.Item>
                      <Link to='/join'>Join</Link>
                    </Menu.Item>
                  </>
                )
              }
            </Menu>
          </Col>
        </Row>
        <Content style={{ padding: '1em' }}>
          <Switch>
            <Route exact path='/'>
              Landing
            </Route>
            <Route path='/operators' render={() => <Operators user={user} />} />
            <Route path='/deployment-options' render={() => <EnumManager title='Deployment options' path='/deployment-options' user={user} />} />
            <Route path='/duplex-modes' render={() => <EnumManager title='Duplex modes' path='/duplex-modes' user={user} />} />
            <Route path='/network-elements' render={() => <EnumManager title='Network elements' path='/network-elements' user={user} />} />
            <Route path='/products' render={() => <EnumManager title='Products' path='/products' user={user} />} />
            <Route path='/ran-sharing' render={() => <EnumManager title='RAN sharing' path='/ran-sharing' user={user} />} />
            <Route path='/join' render={() => <Join setWaiting={setWaiting} setUser={setUser} />} />
            <Route path='/login' render={() => <Login setWaiting={setWaiting} setUser={setUser} />} />
          </Switch>
        </Content>
      </Spin>
    </div>
  );
}

export default App;
