import axios from "axios";
import { Component } from "react";
import { Route, RouteComponentProps, Switch, withRouter } from "react-router-dom";
import { Menu } from "semantic-ui-react";
import { config } from 'randevu-shared/dist/config';
import Join from "./routes/join";
import Login from "./routes/login";
import Landing from "./routes/landing";
import Feature from "./routes/feature";
import Admin from "./routes/admin";

type State = {
  authenticated: boolean,
  role: string | undefined;
};

class Router extends Component<RouteComponentProps, State> {
  constructor(props: RouteComponentProps) {
    super(props);
    this.state = {
      authenticated: false,
      role: undefined,
    };
    const { api } = config;
    axios.defaults.baseURL = `http://${api.host}:${api.port}`;
    axios.defaults.withCredentials = true;
    this.logout = this.logout.bind(this);
    this.updateAuthenticationResult = this.updateAuthenticationResult.bind(this);
  }

  componentDidMount() {
    axios.get('/authenticate').then((value) => {
      const { role } = value.data;
      this.setState({ authenticated: true, role });
    }).catch((reason) => {
      console.error(reason);
    });
  }

  logout() {
    axios.get('/logout').then((value) => {
      this.setState({ authenticated: false });
      const { history } = this.props;
      history.push('/');
    }).catch((reason) => {
      console.error(reason);
    });
  }

  updateAuthenticationResult(authenticated: boolean, role: string | undefined) {
    this.setState({ authenticated, role });
    const { history } = this.props;
    history.push('/');
  }

  render() {
    const { history } = this.props;
    const { authenticated, role } = this.state;
    return (
      <>
        <Menu>
          <Menu.Item header onClick={() => history.push('/')}>RANdevU</Menu.Item>
          <Menu.Item onClick={() => {history.push('/features')}} disabled={!authenticated}>Features</Menu.Item>
          <Menu.Menu position='right'>
            {
              authenticated && role === 'admin' ? (
                <Menu.Item onClick={() => history.push('/admin')}>Admin</Menu.Item>
              ) : <></>
            }
            {
              authenticated ? (
                <Menu.Item onClick={this.logout}>Logout</Menu.Item>
              ) : (
                <>
                  <Menu.Item onClick={() => history.push('/join')}>Join</Menu.Item>
                  <Menu.Item onClick={() => history.push('/login')}>Login</Menu.Item>
                </>
              )
            }
          </Menu.Menu>
        </Menu>
        <Switch>
          <Route exact path='/'><Landing /></Route>
          <Route path='/features'>
            <Feature onUpdateAuthenticationResult={this.updateAuthenticationResult} role={role} />
          </Route>
          <Route path='/admin'><Admin /></Route>
          <Route path='/join'><Join /></Route>
          <Route path='/login'>
            <Login onUpdateAuthenticationResult={this.updateAuthenticationResult} />
          </Route>
          <Route path='*'>Not found</Route>
        </Switch>
      </>
    );
  }
}

const RouterWithRouter = withRouter(Router);

export default RouterWithRouter;
