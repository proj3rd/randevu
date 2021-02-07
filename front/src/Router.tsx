import axios from "axios";
import { Component } from "react";
import { Route, RouteComponentProps, Switch, withRouter } from "react-router-dom";
import { Menu } from "semantic-ui-react";
import { config } from 'randevu-shared/dist/config';
import Join from "./routes/join";
import Login from "./routes/login";
import Landing from "./routes/landing";
import Feature from "./routes/feature";

type State = {
  authenticated: boolean,
};

class Router extends Component<RouteComponentProps, State> {
  constructor(props: RouteComponentProps) {
    super(props);
    this.state = {
      authenticated: false,
    };
    const { api } = config;
    axios.defaults.baseURL = `http://${api.host}:${api.port}`;
    this.onClickLogout = this.onClickLogout.bind(this);
    this.onUpdateAuthenticationResult = this.onUpdateAuthenticationResult.bind(this);
  }

  componentDidMount() {
    axios.get('/authenticate').then((value) => {
      this.setState({ authenticated: true });
    }).catch((reason) => {
      console.error(reason);
    });
  }

  onClickLogout() {
    axios.get('/logout').then((value) => {
      this.setState({ authenticated: false });
      const { history } = this.props;
      history.push('/');
    }).catch((reason) => {
      console.error(reason);
    });
  }

  onUpdateAuthenticationResult(authenticated: boolean) {
    this.setState({ authenticated });
    const { history } = this.props;
    history.push('/');
  }

  render() {
    const { history } = this.props;
    const { authenticated } = this.state;
    return (
      <>
        <Menu>
          <Menu.Item header onClick={() => history.push('/')}>randevu</Menu.Item>
          <Menu.Item onClick={() => {history.push('/features')}} disabled={!authenticated}>Features</Menu.Item>
          <Menu.Menu position='right'>
            {
              authenticated ? (
                <Menu.Item onClick={this.onClickLogout}>Logout</Menu.Item>
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
            <Feature />
          </Route>
          <Route path='/join'><Join /></Route>
          <Route path='/login'>
            <Login updateAuthenticationResult={this.onUpdateAuthenticationResult} />
          </Route>
          <Route path='*'>Not found</Route>
        </Switch>
      </>
    );
  }
}

const RouterWithRouter = withRouter(Router);

export default RouterWithRouter;
