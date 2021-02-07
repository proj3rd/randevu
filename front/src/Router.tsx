import { Route, Switch, useHistory } from "react-router-dom";
import { Menu } from "semantic-ui-react";
import Join from "./routes/join";
import Login from "./routes/login";

export function Router() {
  const history = useHistory();
  return (
    <>
      <Menu>
        <Menu.Item header onClick={() => history.push('/')}>randevu</Menu.Item>
        <Menu.Item onClick={() => {history.push('/features')}}>Features</Menu.Item>
        <Menu.Menu position='right'>
          <Menu.Item onClick={() => history.push('/join')}>Join</Menu.Item>
          <Menu.Item onClick={() => history.push('/login')}>Login</Menu.Item>
          <Menu.Item>Logout</Menu.Item>
        </Menu.Menu>
      </Menu>
      <Switch>
        <Route exact path='/'>randevu</Route>
        <Route path='/features'>features</Route>
        <Route path='/join'><Join /></Route>
        <Route path='/login'><Login /></Route>
        <Route path='*'>Not found</Route>
      </Switch>
    </>
  );
}

export default Router;
