import { Button, Col, Row, Spin, Table, Tabs, Tree } from "antd";
import Column from "antd/lib/table/Column";
import axios from "axios";
import { DataNode } from "rc-tree/lib/interface";
import { useEffect, useState } from "react";
import { regionListToDataNodeList } from "../utils";

type Props = {
  operator: string;
};

export default function FrequencyAllocationManager({ operator }: Props) {
  const [waiting, setWaiting] = useState(false);
  const [regionList, setRegionList] = useState<DataNode[]>([]);

  useEffect(() => {
    setWaiting(true);
    const promiseRegion = axios.get(`/regions`);
    const promiseFrequencyAllocations = axios.get(`/operators/${operator}/frequency-allocations?include[]=region`);
    Promise.all([promiseRegion, promiseFrequencyAllocations]).then(([responseRegion, responseFrequencyAllocations]) => {
      const { data: regionList } = responseRegion;
      const dataNodeList = regionListToDataNodeList(regionList);
      setRegionList(dataNodeList);
      const { data: frequencyAllocationList } = responseFrequencyAllocations;
      // TODO
      setWaiting(false);
    }).catch((reason) => {
      console.error(reason);
    });
  }, [operator]);

  return (
    <Spin spinning={waiting}>
      <Tabs defaultActiveKey="all">
        <Tabs.TabPane tab="All" key="all">
          <Button>Add a frequency allocation</Button>
          <FrequencyAllocationTable />
        </Tabs.TabPane>
        <Tabs.TabPane tab="Regional" key="regional">
          <>
            <Row>
              <Col span={6}>
                <Tree treeData={regionList} />
              </Col>
              <Col span={18}>
                <Button>Map frequency allocations to this region</Button>
                <FrequencyAllocationTable />
              </Col>
            </Row>
          </>
        </Tabs.TabPane>
      </Tabs>
    </Spin>
  );
}

function FrequencyAllocationTable() {
  return (
    <Table>
      <Column key='alias' dataIndex='alias' title='Alias' />
      <Column key='rat' dataIndex='rat' title='RAT' />
      <Column key='band' dataIndex='band' title='Band' />
      <Column key='uplink' dataIndex='uplink' title='Uplink' />
      <Column key='downlink' dataIndex='downlink' title='Downlink' />
      <Column key='duplex' dataIndex='duplex' title='Duplex mode' />
    </Table>
  );
}
