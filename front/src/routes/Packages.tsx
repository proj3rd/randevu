import axios from "axios";
import { DocUser } from "randevu-shared/dist/types";
import { useEffect, useState } from "react";
import { Route, Switch, useRouteMatch } from "react-router-dom";
import { Container, Dimmer, Loader } from "semantic-ui-react";
import PackageInfo from "./packages/PackageInfo";
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
      <Dimmer.Dimmable>
        <Switch>
          <Route exact path={path} render={() => <PackageList user={user} />} />
          <Route path={`${path}/:seqVal`} render={() => <PackageInfo user={user} />} />
        </Switch>
        <Dimmer active={waiting}>
          <Loader />
        </Dimmer>
      </Dimmer.Dimmable>
    </Container>
  );
}
