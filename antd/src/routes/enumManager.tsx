import { Spin } from "antd";
import Title from "antd/lib/typography/Title";
import axios from "axios";
import { DocEnum, DocUser } from "randevu-shared/dist/types";
import { seqValOf } from 'randevu-shared/dist/utils';
import { useCallback, useEffect, useState } from "react";
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

  const getEnumList = useCallback(() => {
    return axios.get(path).then((response) => {
      const enumList = response.data.map((item: DocEnum) => {
        const { _id } = item;
        return { key: _id, ...item };
      });
      setEnumList(enumList);
    }).catch((reason) => {
      console.error(reason);
    });
  }, [path])

  useEffect(() => {
    setWaitingApp?.(true);
    axios.get('/authenticate').then((response) => {
      const { data: user } = response;
      setUser?.(user);
      setWaiting(true);
      getEnumList().finally(() => {
        setWaiting(false);
      });
    }).catch((reason) => {
      setUser?.(undefined);
      history.push(`/login?redirect=${url}`);
    }).finally(() => {
      setWaitingApp?.(false);
    })
  }, [history, url, setUser, setWaitingApp, getEnumList]);

  function onChangeEnum(_id: string, name: string) {
    setWaiting(true);
    axios.post(`${path}/${seqValOf(_id)}`, { name }).then((response) => {
      getEnumList().finally(() => {
        setWaiting(false);
      });
    }).catch((reason) => {
      console.error(reason);
      setWaiting(false);
    });
  }

  return (
    <>
      <Title level={3}>{title}</Title>
      <Spin spinning={waiting}>
        <EnumTable dataSource={enumList} onChangeEnum={onChangeEnum} />
      </Spin>
    </>
  );
}
