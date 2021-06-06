import { Breadcrumb, Button, Col, Row, Skeleton, Table, Typography } from "antd";
import Title from "antd/lib/typography/Title";
import axios from "axios";
import { DocOperator, DocUser } from "randevu-shared/dist/types";
import { seqValOf } from "randevu-shared/dist/utils";
import { useEffect, useState } from "react";
import { useParams } from "react-router"

type Props = {
  user?: DocUser | undefined;
}

export default function OperatorInfo({ user }: Props) {
  const { seqVal } = useParams<{ seqVal: string }>();

  const [name, setName] = useState('');
  const [packageList, setPackageList] = useState<DocOperator[]>([]);

  const columns: any[] = [
    { key: 'name', dataIndex: 'name', title: 'Name' },
  ].map((column) => {
    const { dataIndex } = column;
    return {
      ...column,
      onCell: (record: any) => {
        return { record, dataIndex };
      },
    };
  });

  const dataSource = packageList.map((pkg) => {
    const { _id } = pkg;
    return { key: _id, ...pkg };
  });

  useEffect(() => {
    axios.get(`/operators/${seqVal}`).then((response) => {
      const { name } = response.data as DocOperator;
      setName(name);
    }).catch((reason) => {
      console.error(reason);
    });
    axios.get(`/operators/${seqVal}/packages`).then((response) => {
      const { data: packageList } = response;
      setPackageList(packageList);
    }).catch((reason) => {
      console.error(reason);
    });
  }, [seqVal]);

  return (
    <>
      <Breadcrumb>
        <Breadcrumb.Item>Operators</Breadcrumb.Item>
      </Breadcrumb>
      <Title level={3}>
        {
          name || <Skeleton.Input style={{ width: 200 }} active />
        }
      </Title>
      <Title level={4}>Frequency allocations</Title>
      <>
        <Row>
          <Col span={6}>Tree</Col>
          <Col span={18}>Frequency allocations</Col>
        </Row>
      </>
      <Title level={4}>Packages</Title>
      <Button>Package map</Button>
      <Table
        columns={columns}
        dataSource={dataSource}
        components={{
          body: {
            cell: Cell,
          },
        }}
        pagination={false}
      />
    </>
  );
}

function Cell({ record, dataIndex, children, ...props }: any) {
  const { _id } = record ?? {};
  return  (
    <td {...props}>
      {
        dataIndex === 'name' ? (
          <Typography.Link href={`/packages/sub/${seqValOf(_id)}`}>
            {children}
          </Typography.Link>
        ) : (null)
      }
    </td>
  )
}
