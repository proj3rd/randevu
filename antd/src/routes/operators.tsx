import { Spin, Table } from "antd";
import Title from "antd/lib/typography/Title";
import axios from "axios";
import { DocOperator, DocUser } from "randevu-shared/dist/types";
import { useCallback, useEffect, useState } from "react";
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
  const [operatorList, setOperatorList] = useState<DocOperator[]>([]);

  const columns = [
    { key: 'name', dataIndex: 'name', title: 'Name', width: '50%' },
    { key: 'owner', dataIndex: 'owner', title: 'Owner', width: '25%' },
    { key: 'actions', dataIndex: 'actions', title: 'actions', width: '25%' },
  ];

  const getOperatorList = useCallback(() => {
    return axios.get('/operators?include[]=owner').then((response) => {
      const { data: operatorList } = response;
      setOperatorList(operatorList);
    }).catch((reason) => {
      console.error(reason);
    });
  }, []);

  useEffect(() => {
    setWaitingApp?.(true);
    axios.get('/authenticate').then((response) => {
      const { data: user } = response;
      setWaiting(true);
      getOperatorList().finally(() => {
        setWaiting(false);
      });
    }).catch((reason) => {
      console.error(reason);
      setUser?.(undefined);
      history.push(`/login?redirect=${url}`);
    }).finally(() => {
      setWaitingApp?.(false);
    });
  }, []);

  const dataSource = operatorList.map((operator) => {
    const { _id } = operator;
    return { key: _id, ...operator };
  });
  return (
    <>
      <Title level={3}>Operators</Title>
      <Spin spinning={waiting}>
        <Table dataSource={dataSource} columns={columns} />
      </Spin>
    </>
  )
}
