import axios from "axios";
import { DocUser } from "randevu-shared/dist/types";
import { useEffect, useState } from "react";
import { Route, Switch, useRouteMatch } from "react-router-dom";
import { Container, Dimmer, Loader } from "semantic-ui-react";
import PackageInfo from "./packages/PackageInfo";
import PackageSearch from "./packages/PackageSearch";

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
          <Route exact path={path} render={() => <PackageSearch user={user} />} />
          <Route path={`${path}/main/:seqVal`} render={() => <PackageInfo user={user} type='main' />} />
          <Route path={`${path}/sub/:seqVal`} render={() => <PackageInfo user={user} type='sub' />} />
        </Switch>
        <Dimmer active={waiting}>
          <Loader />
        </Dimmer>
      </Dimmer.Dimmable>
    </Container>
  );
}
