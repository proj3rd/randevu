import { Route, Switch, useHistory, useRouteMatch, withRouter } from "react-router-dom";
import { Container, Header, Tab, TabProps } from "semantic-ui-react";
import EnumManager from "../components/EnumManager";

const panes = [
  { menuItem: '', path: '' },
  { menuItem: 'Deployment options', path: '/deployment-options' },
  { menuItem: 'Network elements', path: '/network-elements' },
  { menuItem: 'Radio access technologies', path: '/radio-access-technologies' },
  { menuItem: 'RAN sharing', path: '/ran-sharing' },
  { menuItem: 'Users', path: '/users' },
];

function Admin() {
  const history = useHistory();
  const match = useRouteMatch();

  function onTabChange(event: React.MouseEvent<HTMLDivElement, MouseEvent>, data: TabProps) {
    const { activeIndex } = data;
    if (typeof activeIndex === 'string' || activeIndex === undefined) {
      return;
    }
    const pane = panes[activeIndex];
    if (pane) {
      history.push(`${match.path}${pane.path}`);
    }
  }

  return (
    <Container>
      <Header as='h1'>Admin</Header>
      <Tab menu={{ secondary: true, pointing: true }} panes={panes} onTabChange={onTabChange} />
      <Switch>
        <Route exact path={`${match.path}`}>Admin</Route>
        {
          panes.filter((pane) => pane.path).map((pane) => (
            <Route key={pane.path} path={`${match.path}${pane.path}`}>
              <EnumManager path={pane.path} />
            </Route>
          ))
        }
      </Switch>
    </Container>
  );
}

export default withRouter(Admin);
