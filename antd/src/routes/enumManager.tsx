import Title from "antd/lib/typography/Title";
import axios from "axios";
import { DocEnum, DocUser } from "randevu-shared/dist/types";
import { useEffect, useState } from "react";
import { useHistory, useRouteMatch } from "react-router";
import EnumTable from "../components/enumTable";

type Props = {
  title: string;
  path: string;
  setUser?: (user: DocUser | undefined) => void;
  setWaiting?: (waiting: boolean) => void;
}

export default function EnumManager({ title, path, setUser, setWaiting: setWaitingApp }: Props) {
  const history = useHistory();
  const { url } = useRouteMatch();

  const [waiting, setWaiting] = useState(false);
  const [enumList, setEnumList] = useState<any[]>([]);

  useEffect(() => {
    setWaitingApp?.(true);
    axios.get('/authenticate').then((response) => {
      const { data: user } = response;
      setUser?.(user);
      getEnumList();
    }).catch((reason) => {
      setUser?.(undefined);
      history.push(`/login?redirect=${url}`);
    }).finally(() => {
      setWaitingApp?.(false);
    })
  }, [history, url, setUser, setWaitingApp]);

  function getEnumList() {
    setWaiting(true);
    axios.get(path).then((response) => {
      const enumList = response.data.map((item: DocEnum) => {
        const { _id } = item;
        return { key: _id, ...item };
      });
      setEnumList(enumList);
    }).catch((reason) => {
      console.error(reason);
    }).finally(() => {
      setWaiting(false);
    })
  }

  return (
    <>
      <Title level={3}>{title}</Title>
      <EnumTable dataSource={enumList} />
    </>
  );
}
