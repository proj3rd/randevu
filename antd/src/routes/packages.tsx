import axios from 'axios';
import { DocUser } from "randevu-shared/dist/types";
import { useEffect } from 'react';
import { Route, useHistory, useRouteMatch } from 'react-router';
import PackageSub from './packageSub';
import PackageList from './packagesList';

type Props = {
  user?: DocUser | undefined;
  setUser?: (user: DocUser | undefined) => void;
  setWaiting?: (waiting: boolean) => void;
};

export default function Packages({ user, setUser, setWaiting: setWaitingApp }: Props) {
  const history = useHistory();
  const { path, url } = useRouteMatch();

  useEffect(() => {
    setWaitingApp?.(true);
    axios.get('/authenticate').then((response) => {
      const { data: user } = response;
      setUser?.(user);
    }).catch((reason) => {
      console.error(reason);
      setUser?.(undefined);
      history.push(`/login?redirect=${url}`);
    }).finally(() => {
      setWaitingApp?.(false);
    });
  }, [history, setUser, setWaitingApp, url]);

  return (
    <>
      <Route exact path={path} render={() => <PackageList user={user} />} />
      <Route path={`${path}/sub/:seqVal`} render={() => <PackageSub />} />
    </>
  )
}
