import { Tree } from "antd";
import Title from "antd/lib/typography/Title";
import axios from "axios";
import { DocUser } from "randevu-shared/dist/types";
import { DataNode } from "rc-tree/lib/interface";
import { useEffect, useState } from "react";
import { useHistory, useRouteMatch } from "react-router";

type Props = {
  user?: DocUser | undefined;
  setUser?: (user: DocUser | undefined) => void;
  setWaiting?: (waiting: boolean) => void;
};

export default function Regions({ user, setUser, setWaiting: setWaitingApp }: Props) {
  const history = useHistory();
  const { url } = useRouteMatch();

  const [regions, setRegions] = useState<DataNode[]>([
    {
      title: 'Globe',
      key: 'Globe',
    }
  ]);

  useEffect(() => {
    setWaitingApp?.(true);
    axios.get('/authenticate').then((response) => {
      const { data: user } = response;
      setUser?.(user);
    }).catch((reason) => {
      setUser?.(undefined);
      history.push(`/login?redirect=${url}`);
    }).finally(() => {
      setWaitingApp?.(false);
    })
  }, [history, url, setUser, setWaitingApp]);

  return (
    <>
      <Title level={3}>Regions</Title>
      <Tree treeData={regions} />
    </>
  )
}
