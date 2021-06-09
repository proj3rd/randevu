import { Button, Col, Row, Table, Tree } from "antd";
import Column from "antd/lib/table/Column";

export default function FrequencyAllocationManager() {
  return (
    <>
      <Button>Add a frequency allocation</Button>
      <>
        <Row>
          <Col span={6}>
            Regions
            <Tree />
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
    </>
  );
}
