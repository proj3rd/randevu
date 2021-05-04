import './App.css';
import { Col, Menu, Row } from "antd";
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import { Content } from 'antd/lib/layout/layout';

function App() {
  return (
    <div className="App">
      <BrowserRouter>
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
              <Menu.Item>Admin</Menu.Item>
              <Menu.Item>Login</Menu.Item>
              <Menu.Item>Logout</Menu.Item>
              <Menu.Item>Join</Menu.Item>
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
      </BrowserRouter>
    </div>
  );
}

export default App;
