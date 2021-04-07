import axios from 'axios';
import { config } from 'randevu-shared/dist/config';
import { User } from 'randevu-shared/dist/types';
import { useEffect, useState } from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import 'semantic-ui-css/semantic.min.css';
import { Dimmer, Dropdown, Label, Loader, Menu } from 'semantic-ui-react';
import ModalJoinLogin from './components/ModalJoinLogin';
import CollectionManager from './routes/CollectionManager';

const { api } = config;
axios.defaults.baseURL = `http://${api.host}:${api.port}`;
axios.defaults.withCredentials = true;

function App() {
  const [authenticated, setAuthenticated] = useState<boolean | undefined>(undefined);
  const [user, setUser] = useState<User | undefined>(undefined);

  useEffect(() => {
    axios.get('/authenticate').then((response) => {
      const { data: user } = response;
      setAuthenticated(true);
      setUser(user);
    }).catch((reason) => {
      console.error(reason);
      setAuthenticated(false);
    });
  }, []);

  function logout() {
    axios.get('/logout').then((response) => {
      onLogout();
    }).catch((reason) => {
      console.error(reason);
    });
  }

  function onLogin(user: User) {
    setAuthenticated(true);
    setUser(user);
  }

  function onLogout() {
    setAuthenticated(false);
    setUser(undefined);
  }

  return (
    <div className="App">
      <Dimmer.Dimmable dimmed={authenticated === undefined} blurring={true}>
        <Dimmer active={authenticated === undefined}>
          <Loader size='massive' />
        </Dimmer>
        <div style={{ minHeight: '100vh' }}>
          <BrowserRouter>
            <Menu>
              <Menu.Item header>RANdevU</Menu.Item>
              <Menu.Item>Feature</Menu.Item>
              <Menu.Item>Operator</Menu.Item>
              <Menu.Item>Package</Menu.Item>
              <Menu.Item>Requirement</Menu.Item>
              <Dropdown item text='Collection' simple>
                <Dropdown.Menu>
                  <Dropdown.Item>Deployment option</Dropdown.Item>
                  <Dropdown.Item>Duplex mode</Dropdown.Item>
                  <Dropdown.Item>Network element</Dropdown.Item>
                  <Dropdown.Item>Product</Dropdown.Item>
                  <Dropdown.Item>Radio access technology</Dropdown.Item>
                  <Dropdown.Item>RAN sharing</Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
              <Menu.Menu position='right'>
                {
                  user ? (
                    <Menu.Item>
                      <Label size='tiny'>0</Label>
                    </Menu.Item>
                  ) : (<></>)
                }
                {
                  user && user.role === 'admin' ? (
                    <Menu.Item>Admin</Menu.Item>
                  ) : (<></>)
                }
                <Menu.Item onClick={logout}>Logout</Menu.Item>
              </Menu.Menu>
            </Menu>
            <Switch>
              <Route exact path='/'>
                /
              </Route>
              <Route path='/deployment-options' render={() => <CollectionManager title='Deployment option' path='/deployment-options' />} />
              <Route path='/duplex-modes' render={() => <CollectionManager title='Duplex mode' path='/duplex-modes' />} />
              <Route path='/network-elements' render={() => <CollectionManager title='Network element' path='/network-elements' />} />
              <Route path='/products' render={() => <CollectionManager title='Product' path='/products' />} />
              <Route path='/radio-access-technologies' render={() => <CollectionManager title='Radio access technology' path='/radio-access-technologies' />} />
              <Route path='/ran-sharing' render={() => <CollectionManager title='RAN sharing' path='/ran-sharing' />} />
            </Switch>
          </BrowserRouter>
        </div>
      </Dimmer.Dimmable>
      <ModalJoinLogin open={authenticated === false} onLogin={onLogin} />
    </div>
  );
}

export default App;
