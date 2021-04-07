import { useEffect, useState } from 'react';
import 'semantic-ui-css/semantic.min.css';
import { Dimmer, Loader, Menu } from 'semantic-ui-react';
import ModalJoinLogin from './components/ModalJoinLogin';

function App() {
  const [authenticated, setAuthenticated] = useState<boolean | undefined>(undefined);

  useEffect(() => {
    // Mocking authentication
    setTimeout(() => {
      setAuthenticated(false);
    }, 3000);
  }, []);

  return (
    <div className="App">
      <Dimmer.Dimmable dimmed={authenticated === undefined} blurring={true}>
        <Dimmer active={authenticated === undefined}>
          <Loader size='massive' />
        </Dimmer>
        <div style={{ minHeight: '100vh' }}>
          <Menu>
            <Menu.Item header>RANdevU</Menu.Item>
          </Menu>
        </div>
      </Dimmer.Dimmable>
      <ModalJoinLogin open={authenticated === false} />
    </div>
  );
}

export default App;
