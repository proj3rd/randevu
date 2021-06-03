import { Button, Form, Input, Skeleton, Spin, Tree } from "antd";
import { useForm } from "antd/lib/form/Form";
import { Key } from "antd/lib/table/interface";
import { EventDataNode } from "antd/lib/tree";
import Title from "antd/lib/typography/Title";
import axios from "axios";
import { DocRegion, DocUser } from "randevu-shared/dist/types";
import { isAdmin } from "randevu-shared/dist/utils";
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

  const [form] = useForm();

  const [waiting, setWaiting] = useState(false);
  const [name, setName] = useState('');
  const [regionList, setRegionList] = useState<DataNode[] | undefined>(undefined);
  const [selectedNode, setSelectedNode] = useState<DataNode | undefined>(undefined);

  useEffect(() => {
    setWaitingApp?.(true);
    axios.get('/authenticate').then((response) => {
      const { data: user } = response;
      setUser?.(user);
      setWaiting(true);
      getRegionList().then(() => {
        setWaiting(false);
      })
    }).catch((reason) => {
      setUser?.(undefined);
      history.push(`/login?redirect=${url}`);
    }).finally(() => {
      setWaitingApp?.(false);
    })
  }, [history, url, setUser, setWaitingApp]);

  async function getRegionList() {
    return axios.get('/regions').then((response) => {
      const regionList: (DataNode & { belongsTo: string | undefined })[] = (
        response.data as DocRegion[]
      ).map((region) => {
        const { _id, name, belongsTo } = region;
        return { key: _id, title: name, children: [], belongsTo };
      });
      // Put a region into an upper region
      regionList.forEach((region) => {
        const { belongsTo } = region;
        const regionUpper = regionList.find((region) => region.key === belongsTo);
        if (regionUpper) {
          regionUpper.children?.push(region);
        }
      });
      // Find the top level region
      const topLevelRegion = regionList.find((region) => !region.belongsTo);
      if (topLevelRegion) {
        setRegionList([topLevelRegion]);
      } else {
        setRegionList([]);
      }
    }).catch((reason) => {
      console.error(reason);
    });
  }

  function onChangeName(e: any) {
    setName(e.target.value);
  }

  function onSelect(
    selectedKeys: Key[],
    info: {
      event: "select";
      selected: boolean;
      node: EventDataNode;
      selectedNodes: DataNode[];
      nativeEvent: MouseEvent;
    }
  ) {
    if (info.selected) {
      setSelectedNode(info.node);
    } else {
      setSelectedNode(undefined);
    }
  }

  function onSubmit() {
    setWaiting(true);
    const belongsTo = selectedNode?.key ?? undefined;
    axios.post('/regions', { name, belongsTo }).then((response) => {
      getRegionList().then(() => {
        setWaiting(false);
      });
    }).catch((reason) => {
      console.error(reason);
      setWaiting(false);
    });
  }

  return (
    <>
      <Title level={3}>Regions</Title>
      <Spin spinning={waiting}>
        <Form form={form} layout='inline' onFinish={onSubmit}>
          {
            !regionList ? (
              <Skeleton />
            ) : !regionList.length && isAdmin(user) ? (
              <>
                <Form.Item name='name' rules={[ { required: true }]} help={false}>
                  <Input onChange={onChangeName} />
                </Form.Item>
                <Form.Item>
                  <Button disabled={!name}>Add a region</Button>
                </Form.Item>
              </>
            ) : isAdmin(user) ? (
              <>
                <Form.Item name='name' rules={[ { required: true }]} help={false}>
                  <Input onChange={onChangeName} />
                </Form.Item>
                <Form.Item>
                  <Button disabled={!selectedNode || !name}>
                    Add a region under {selectedNode?.title ?? '...'}
                  </Button>
                </Form.Item>
              </>
            ) : (null)
          }
        </Form>
        <Tree treeData={regionList} onSelect={onSelect} />
      </Spin>
    </>
  )
}
