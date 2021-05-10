import { Button, Form, Input, Select, Skeleton, Table, Typography } from 'antd/lib';
import Title from "antd/lib/typography/Title";
import { SearchOutlined } from '@ant-design/icons';
import axios from 'axios';
import { DocOperator, DocUser } from "randevu-shared/dist/types";
import { useEffect, useState } from 'react';
import { useHistory, useRouteMatch } from 'react-router';
import { useForm } from 'antd/lib/form/Form';
import ModalCreatePackage from '../components/modalCreatePackage';

type Props = {
  user?: DocUser | undefined;
  setUser?: (user: DocUser | undefined) => void;
  setWaiting?: (waiting: boolean) => void;
};

export default function Packages({ user, setUser, setWaiting: setWaitingApp }: Props) {
  const history = useHistory();
  const { url } = useRouteMatch();

  const [waiting, setWaiting] = useState(false);
  const [isModalVisible, setModalVisible] = useState(false);
  const [form] = useForm();
  const [packageList, setPackageList] = useState<DocOperator[]>([]);

  const columns: any[] = [
    { key: 'name', dataIndex: 'name', title: 'Name', editable: true, width: '40%' },
    { key: 'operator', dataIndex: 'operator', title: 'Operator', editable: true, width: '20%' },
    { key: 'owner', dataIndex: 'owner', title: 'Owner', editable: true, width: '20%' },
    {
      key: 'actions', dataIndex: 'actions', title: 'Actions', width: '20%',
      render: (_: any, record: any) => {
        return (
          <Typography.Link>
            <SearchOutlined /> Search
          </Typography.Link>
        )
      }
    },
  ].map((column) => {
    const { dataIndex, editable } = column;
    if (!editable) {
      return column;
    }
    return {
      ...column,
      onCell: (record: any) => ({
        record,
        dataIndex,
      }),
    }
  });

  useEffect(() => {
    setWaitingApp?.(true);
    axios.get('/authenticate').then((response) => {
      const { data: user } = response;
      setUser?.(user);
    }).catch((reason) => {
      console.error(reason);
      setUser?.(undefined);
      history.push(`/login?redirect=${url}`);
    }).finally(() => {
      setWaitingApp?.(false);
    });
  }, [history, setUser, setWaitingApp, url]);

  const dataSource = packageList.map((pkg) => {
    const { _id } = pkg;
    return { key: _id, ...pkg };
  });
  dataSource.unshift({ key: '' } as any);

  function onCancelModalCreatePackage() {
    setModalVisible(false);
  }

  function onOkModalCreatePackage() {
    // TODO
  }

  return (
    <>
      <Title level={3}>Packages</Title>
      <Button onClick={() => setModalVisible(true)}>Create a package</Button>
      <Form form={form}>
        <Table
          columns={columns}
          dataSource={dataSource}
          components={{
            body: {
              cell: EditableCell,
            },
          }}
          loading={waiting}
        />
      </Form>
      <ModalCreatePackage
        visible={isModalVisible}
        onCancel={onCancelModalCreatePackage}
        onOk={onOkModalCreatePackage}
      />
    </>
  )
}

function EditableCell({ record, dataIndex, children, ...props }: any) {
  return (
    <td {...props}>
      {
        record?.key === '' && dataIndex === 'name' ? (
          <Form.Item
            name={dataIndex} help={false}
            style={{ margin: 0 }}
          >
            <Input />
          </Form.Item>
        ) : record?.key === '' && dataIndex === 'operator' ? (
          <Form.Item
            name={dataIndex} help={false}
            style={{ margin: 0 }}
          >
            <Select />
          </Form.Item>
        ) : record?.key === '' && dataIndex === 'owner' ? (
          <Skeleton.Input style={{ width: 200 }} />
        ) : (
          children
        )
      }
    </td>
  );
}