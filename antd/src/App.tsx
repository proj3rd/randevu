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
              {/* <Menu.Item>Operators</Menu.Item> */}
              {/* <Menu.Item>Packages</Menu.Item> */}
              {/* <Menu.Item>Requirements</Menu.Item> */}
              <Menu.SubMenu title='Collections'>
                <Menu.Item>
                  <Link to='/deployment-options'>Deployment options</Link>
                  </Menu.Item>
                {/* <Menu.Item>Duplex modes</Menu.Item> */}
                {/* <Menu.Item>Network elements</Menu.Item> */}
                {/* <Menu.Item>Products</Menu.Item> */}
                {/* <Menu.Item>RAN sharing</Menu.Item> */}
              </Menu.SubMenu>
              <Menu.Item></Menu.Item>
              {
                user?.role === 'admin' ? (
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
            <Route path='/deployment-options' render={() => <EnumManager title='Deployment options' path='/deployment-options' />} />
            <Route path='/join' render={() => <Join setWaiting={setWaiting} setUser={setUser} />} />
            <Route path='/login' render={() => <Login setWaiting={setWaiting} setUser={setUser} />} />
          </Switch>
        </Content>
      </Spin>
    </div>
  );
}

export default App;
