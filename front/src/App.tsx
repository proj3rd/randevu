import axios from 'axios';
import { config } from 'randevu-shared/dist/config';
import { User } from 'randevu-shared/dist/types';
import { useEffect, useState } from 'react';
import 'semantic-ui-css/semantic.min.css';
import { Dimmer, Loader, Menu } from 'semantic-ui-react';
import ModalJoinLogin from './components/ModalJoinLogin';

const { api } = config;
axios.defaults.baseURL = `http://${api.host}:${api.port}`;
axios.defaults.withCredentials = true;

function App() {
  const [authenticated, setAuthenticated] = useState<boolean | undefined>(undefined);
  const [user, setUser] = useState<User | undefined>(undefined);

  useEffect(() => {
    axios.get('/authenticate').then((response) => {
      console.log(response.data);
      setAuthenticated(true);
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
          <Menu>
            <Menu.Item header>RANdevU</Menu.Item>
            <Menu.Menu position='right'>
              <Menu.Item onClick={logout}>Logout</Menu.Item>
            </Menu.Menu>
          </Menu>
        </div>
      </Dimmer.Dimmable>
      <ModalJoinLogin open={authenticated === false} onLogin={onLogin} />
    </div>
  );
}

export default App;
