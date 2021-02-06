import 'semantic-ui-css/semantic.min.css';
import { Container, Menu } from 'semantic-ui-react';

function App() {
  return (
    <div className="App">
      <Menu>
        <Menu.Item header>randevu</Menu.Item>
        <Menu.Item>Features</Menu.Item>
        <Menu.Menu position='right'>
          <Menu.Item>Join</Menu.Item>
          <Menu.Item>Login</Menu.Item>
          <Menu.Item>Logout</Menu.Item>
        </Menu.Menu>
      </Menu>
      <Container>
        randevu
      </Container>
    </div>
  );
}

export default App;
