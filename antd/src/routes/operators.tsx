import { Spin, Table } from "antd";
import Title from "antd/lib/typography/Title";
import axios from "axios";
import { DocUser } from "randevu-shared/dist/types";
import { useEffect, useState } from "react";
import { useHistory, useRouteMatch } from "react-router";

type Props = {
  user?: DocUser | undefined;
  setUser?: (user: DocUser | undefined) => void;
  setWaiting?: (waiting: boolean) => void;
}

export default function Operators({ user, setUser, setWaiting: setWaitingApp }: Props) {
  const history = useHistory();
  const { url } = useRouteMatch();

  const [waiting, setWaiting] = useState(false);

  useEffect(() => {
    setWaitingApp?.(true);
    axios.get('/authenticate').then((response) => {
      const { data: user } = response;
      // TODO
    }).catch((reason) => {
      console.error(reason);
      setUser?.(undefined);
      history.push(`/login?redirect=${url}`);
    }).finally(() => {
      setWaitingApp?.(false);
    });
  }, []);

  return (
    <>
      <Title level={3}>Operators</Title>
      <Spin spinning={waiting}>
        <Table></Table>
      </Spin>
    </>
  )
}
