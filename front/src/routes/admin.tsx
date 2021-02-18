import { Component } from "react";
import { Route, RouteComponentProps, Switch, withRouter } from "react-router-dom";
import { Container, Header, Tab, TabProps } from "semantic-ui-react";

const panes = [
  { menuItem: '', path: '' },
  { menuItem: 'Deployment options', path: '/deployment-options' },
  { menuItem: 'Network elements', path: '/network-elements' },
  { menuItem: 'Radio access technologies', path: '/radio-access-technologies' },
  { menuItem: 'RAN sharing', path: '/ran-sharing' },
  { menuItem: 'Users', path: '/users' },
];

class Admin extends Component<RouteComponentProps> {
  constructor(props: RouteComponentProps) {
    super(props);
    this.onTabChange = this.onTabChange.bind(this);
  }

  onTabChange(event: React.MouseEvent<HTMLDivElement, MouseEvent>, data: TabProps) {
    const { activeIndex } = data;
    if (typeof activeIndex === 'string' || activeIndex === undefined) {
      return;
    }
    const pane = panes[activeIndex];
    if (pane) {
      const { history, match } = this.props;
      history.push(`${match.path}${pane.path}`);
    }
  }

  render() {
    const { match } = this.props;
    return (
      <Container>
        <Header as='h1'>Admin</Header>
        <Tab menu={{ secondary: true, pointing: true }} panes={panes} onTabChange={this.onTabChange} />
        <Switch>
          <Route exact path={`${match.path}`}>Admin</Route>
          {
            panes.filter((pane) => pane.path).map((pane) => (
              <Route key={pane.path} path={`${match.path}${pane.path}`}>{pane.menuItem}</Route>
            ))
          }
        </Switch>
      </Container>
    );
  }
}

export default withRouter(Admin);
