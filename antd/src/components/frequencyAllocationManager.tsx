import { Button, Col, Row, Spin, Table, Tree } from "antd";
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
    axios.get(`/regions`).then((response) => {
      const { data: regionList } = response;
      const dataNodeList = regionListToDataNodeList(regionList);
      setRegionList(dataNodeList);
    }).catch((reason) => {
      console.error(reason);
    });
  }, [operator]);

  return (
    <Spin spinning={waiting}>
      <Button>Add a frequency allocation</Button>
      <>
        <Row>
          <Col span={6}>
            Regions
            <Tree treeData={regionList} />
          </Col>
          <Col span={18}>
            Frequency allocations
            <Table>
              <Column key='alias' dataIndex='alias' title='Alias' />
              <Column key='rat' dataIndex='rat' title='RAT' />
              <Column key='band' dataIndex='band' title='Band' />
              <Column key='uplink' dataIndex='uplink' title='Uplink' />
              <Column key='downlink' dataIndex='downlink' title='Downlink' />
              <Column key='duplex' dataIndex='duplex' title='Duplex mode' />
            </Table>
          </Col>
        </Row>
      </>
    </Spin>
  );
}
