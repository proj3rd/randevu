import axios from "axios";
import { Component } from "react";
import { Route, RouteComponentProps, Switch, withRouter } from "react-router-dom";
import { Menu } from "semantic-ui-react";
import { config } from 'randevu-shared/dist/config';
import Join from "./routes/join";
import Login from "./routes/login";

type State = {
  authenticated: boolean,
};

class Router extends Component<RouteComponentProps, State> {
  constructor(props: RouteComponentProps) {
    super(props);
    this.state = {
      authenticated: false,
    };
  }

  componentDidMount() {
    const { api } = config;
    axios.defaults.baseURL = `https://${api.host}:${api.port}`;
    axios.get('/authenticate').then((value) => {
      this.setState({ authenticated: true });
    }).catch((reason) => {
      console.error(reason);
    });
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
                <Menu.Item>Logout</Menu.Item>
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
          <Route exact path='/'>randevu</Route>
          <Route path='/features'>features</Route>
          <Route path='/join'><Join /></Route>
          <Route path='/login'><Login /></Route>
          <Route path='*'>Not found</Route>
        </Switch>
      </>
    );
  }
}

const RouterWithRouter = withRouter(Router);

export default RouterWithRouter;
