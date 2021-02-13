import axios from "axios";
import { Component } from "react";
import { Route, RouteComponentProps, Switch, withRouter } from "react-router-dom";
import { Dimmer, Loader, Menu } from "semantic-ui-react";
import { config } from 'randevu-shared/dist/config';
import Join from "./routes/join";
import Login from "./routes/login";
import Landing from "./routes/landing";
import Feature from "./routes/feature";
import Admin from "./routes/admin";
import Operator from "./routes/operator";
import Package from "./routes/package";
import FeatureDetail from "./routes/featureDetail";

type State = {
  loading: boolean,
  username: string | undefined,
  role: string | undefined;
};

class Router extends Component<RouteComponentProps, State> {
  constructor(props: RouteComponentProps) {
    super(props);
    this.state = {
      loading: false,
      username: undefined,
      role: undefined,
    };
    const { api } = config;
    axios.defaults.baseURL = `http://${api.host}:${api.port}`;
    axios.defaults.withCredentials = true;
    this.logout = this.logout.bind(this);
    this.updateAuthenticationResult = this.updateAuthenticationResult.bind(this);
  }

  componentDidMount() {
    this.setState({ loading: true });
    axios.get('/authenticate').then((value) => {
      const { username, role } = value.data;
      this.setState({ loading: false, username, role });
    }).catch((reason) => {
      console.error(reason);
      this.setState({ loading: false });
    });
  }

  logout() {
    this.setState({ loading: true });
    axios.get('/logout').then((value) => {
      this.setState({ loading: false, username: undefined, role: undefined });
      const { history } = this.props;
      history.push('/');
    }).catch((reason) => {
      console.error(reason);
      this.setState({ loading: false });
    });
  }

  updateAuthenticationResult(username: string | undefined, role: string | undefined) {
    this.setState({ username, role });
    const { history } = this.props;
    history.push('/');
  }

  render() {
    const { history } = this.props;
    const { loading, username, role } = this.state;
    return (
      <>
        <Menu>
          <Menu.Item header onClick={() => history.push('/')}>RANdevU</Menu.Item>
          <Menu.Item onClick={() => {history.push('/features')}} disabled={!username}>Features</Menu.Item>
          <Menu.Item onClick={() => {history.push('/operators')}} disabled={!username}>Operators</Menu.Item>
          <Menu.Item onClick={() => {history.push('/packages')}} disabled={!username}>Packages</Menu.Item>
          <Menu.Item disabled>Requirements</Menu.Item>
          <Menu.Item disabled>TDocs</Menu.Item>
          <Menu.Menu position='right'>
            {
              username && role === 'admin' ? (
                <Menu.Item onClick={() => history.push('/admin')}>Admin</Menu.Item>
              ) : <></>
            }
            {
              username ? (
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
            <Feature onUpdateAuthenticationResult={this.updateAuthenticationResult} username={username} role={role} />
          </Route>
          <Route path='/features'>
            <FeatureDetail onUpdateAuthenticationResult={this.updateAuthenticationResult} />
          </Route>
          <Route path='/operators'>
            <Operator onUpdateAuthenticationResult={this.updateAuthenticationResult} role={role} />
          </Route>
          <Route path='/packages'>
            <Package onUpdateAuthenticationResult={this.updateAuthenticationResult} role={role} />
          </Route>
          <Route path='/admin'><Admin /></Route>
          <Route path='/join'><Join /></Route>
          <Route path='/login'>
            <Login onUpdateAuthenticationResult={this.updateAuthenticationResult} />
          </Route>
          <Route path='*'>Not found</Route>
        </Switch>
        <Dimmer active={loading}>
          <Loader />
        </Dimmer>
      </>
    );
  }
}

export default withRouter(Router);
