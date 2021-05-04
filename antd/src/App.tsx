import './App.css';
import { Col, Menu, Row, Spin } from "antd";
import { config } from 'randevu-shared/dist/config';
import { DocUser } from 'randevu-shared/dist/types';
import { BrowserRouter, Link, Route, Switch } from 'react-router-dom';
import { Content } from 'antd/lib/layout/layout';
import { useEffect, useState } from 'react';
import axios from 'axios';

const { api } = config;
const { host, port } = api;
axios.defaults.baseURL = `htpp://${host}:${port}`;
axios.defaults.withCredentials = true;

function App() {
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

  return (
    <div className="App">
      <BrowserRouter>
        <Spin spinning={waiting}>
          <Row >
            <Col span={24}>
              <Menu mode='horizontal'>
                <Menu.Item>RANdevU</Menu.Item>
                <Menu.Item></Menu.Item>
                <Menu.Item>Features</Menu.Item>
                <Menu.Item>Operators</Menu.Item>
                <Menu.Item>Packages</Menu.Item>
                <Menu.Item>Requirements</Menu.Item>
                <Menu.SubMenu title='Collections'>
                  <Menu.Item>Deployment options</Menu.Item>
                  <Menu.Item>Duplex modes</Menu.Item>
                  <Menu.Item>Network elements</Menu.Item>
                  <Menu.Item>Products</Menu.Item>
                  <Menu.Item>RAN sharing</Menu.Item>
                </Menu.SubMenu>
                <Menu.Item></Menu.Item>
                {
                  user?.role === 'admin' ? (
                    <Menu.Item>Admin</Menu.Item>
                  ) : (<></>)
                }
                {
                  user ? (
                    <Menu.Item>Logout</Menu.Item>
                  ) : (
                    <>
                      <Menu.Item>Login</Menu.Item>
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
            </Switch>
          </Content>
        </Spin>
      </BrowserRouter>
    </div>
  );
}

export default App;
