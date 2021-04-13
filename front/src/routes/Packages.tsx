import axios from "axios";
import { DocUser } from "randevu-shared/dist/types";
import { useEffect, useState } from "react";
import { Route, Switch, useRouteMatch } from "react-router-dom";
import { Container, Dimmer, Header, Loader } from "semantic-ui-react";
import PackageList from "./packages/PackageList";

type Props = {
  user: DocUser | undefined;
  onLogout?: () => void;
}

export default function Packages({ user, onLogout }: Props) {
  const { path } = useRouteMatch();

  const [waiting, setWaiting] = useState(false);

  useEffect(() => {
    setWaiting(true);
    axios.get('/authenticate').then((response) => {
      setWaiting(false);
    }).catch((reason) => {
      console.error(reason);
      onLogout && onLogout();
    });
  }, [onLogout]);

  return (
    <Container>
      <Header as='h1'>Packages</Header>
      <Dimmer.Dimmable>
        <Switch>
          <Route exact path={path} render={() => <PackageList user={user} />} />
        </Switch>
        <Dimmer active={waiting}>
          <Loader />
        </Dimmer>
      </Dimmer.Dimmable>
    </Container>
  );
}
