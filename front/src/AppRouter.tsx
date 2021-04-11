import axios from 'axios';
import { config } from 'randevu-shared/dist/config';
import { DocUser } from 'randevu-shared/dist/types';
import { Fragment, useEffect, useState } from 'react';
import { Route, Switch, useHistory } from 'react-router-dom';
import 'semantic-ui-css/semantic.min.css';
import { Dimmer, Dropdown, Label, Loader, Menu } from 'semantic-ui-react';
import ModalJoinLogin from './components/ModalJoinLogin';
import EnumManager from './routes/EnumManager';
import Operators from './routes/Operators';

const { api } = config;
axios.defaults.baseURL = `http://${api.host}:${api.port}`;
axios.defaults.withCredentials = true;

export default function AppRouter() {
  const history = useHistory();

  const [user, setUser] = useState<DocUser | undefined>(undefined);

  useEffect(() => {
    axios.get('/authenticate').then((response) => {
      const { data: user } = response;
      setUser(user);
    }).catch((reason) => {
      console.error(reason);
    });
  }, []);

  function logout() {
    axios.get('/logout').then((response) => {
      onLogout();
    }).catch((reason) => {
      console.error(reason);
    });
  }

  function onLogin(user: DocUser) {
    setUser(user);
  }

  function onLogout() {
    history.push('/');
    setUser(undefined);
  }

  return (
    <Fragment>
      <Dimmer.Dimmable dimmed={user === undefined} blurring={true}>
        <Dimmer active={user === undefined}>
          <Loader size='massive' />
        </Dimmer>
        <div style={{ minHeight: '100vh' }}>
            <Menu>
              <Menu.Item header onClick={() => history.push('/')}>RANdevU</Menu.Item>
              <Menu.Item>Feature</Menu.Item>
              <Menu.Item onClick={() => history.push('/operators')}>Operator</Menu.Item>
              <Menu.Item>Package</Menu.Item>
              <Menu.Item>Requirement</Menu.Item>
              <Dropdown item text='Collection' simple>
                <Dropdown.Menu>
                  <Dropdown.Item onClick={() => history.push('/deployment-options')}>Deployment option</Dropdown.Item>
                  <Dropdown.Item onClick={() => history.push('/duplex-modes')}>Duplex mode</Dropdown.Item>
                  <Dropdown.Item onClick={() => history.push('/network-elements')}>Network element</Dropdown.Item>
                  <Dropdown.Item onClick={() => history.push('/products')}>Product</Dropdown.Item>
                  <Dropdown.Item onClick={() => history.push('/radio-access-technologies')}>Radio access technology</Dropdown.Item>
                  <Dropdown.Item onClick={() => history.push('/ran-sharing')}>RAN sharing</Dropdown.Item>
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
              <Route exact path='/' />
              <Route path='/deployment-options' render={() => <EnumManager title='Deployment option' path='/deployment-options' user={user} onLogout={onLogout} />} />
              <Route path='/duplex-modes' render={() => <EnumManager title='Duplex mode' path='/duplex-modes' user={user} onLogout={onLogout} />} />
              <Route path='/network-elements' render={() => <EnumManager title='Network element' path='/network-elements' user={user} onLogout={onLogout} />} />
              <Route path='/operators' render={() => <Operators user={user} onLogout={onLogout} />} />
              <Route path='/products' render={() => <EnumManager title='Product' path='/products' user={user} onLogout={onLogout} />} />
              <Route path='/radio-access-technologies' render={() => <EnumManager title='Radio access technology' path='/radio-access-technologies' user={user} onLogout={onLogout} />} />
              <Route path='/ran-sharing' render={() => <EnumManager title='RAN sharing' path='/ran-sharing' user={user} onLogout={onLogout} />} />
            </Switch>
        </div>
      </Dimmer.Dimmable>
      <ModalJoinLogin open={user === undefined} onLogin={onLogin} />
    </Fragment>
  );
}
