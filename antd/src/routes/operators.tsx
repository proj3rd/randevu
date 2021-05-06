import { Form, Input, Select, Skeleton, Spin, Table, Typography } from "antd";
import Title from "antd/lib/typography/Title";
import { CheckOutlined } from '@ant-design/icons';
import axios from "axios";
import { DocOperator, DocUser } from "randevu-shared/dist/types";
import { isAdmin, seqValOf } from "randevu-shared/dist/utils";
import { useCallback, useEffect, useState } from "react";
import { useHistory, useRouteMatch } from "react-router";

type Props = {
  user?: DocUser | undefined;
  setUser?: (user: DocUser | undefined) => void;
  setWaiting?: (waiting: boolean) => void;
}

const dummyOptions = [
  { value: 'value', label: 'label' },
];

export default function Operators({ user, setUser, setWaiting: setWaitingApp }: Props) {
  const history = useHistory();
  const { url } = useRouteMatch();

  const [waiting, setWaiting] = useState(false);
  const [form] = Form.useForm();
  const [operatorList, setOperatorList] = useState<DocOperator[]>([]);

  const columns: any[] = [
    { key: 'name', dataIndex: 'name', title: 'Name', width: '50%', editable: true },
    { key: 'owner', dataIndex: 'owner', title: 'Owner', width: '25%', editable: true },
    {
      key: 'actions', dataIndex: 'actions', title: 'Actions', width: '25%',
      render: (_: any, record: any) => {
        return isAdmin(user) && record.key === '' ? (
          <Typography.Link onClick={() => onClickSave(record)}>
            <CheckOutlined /> Save
          </Typography.Link>
        ) : (
          <></>
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

  const getOperatorList = useCallback(async () => {
    return axios.get('/operators').then(async (response) => {
      const operatorList = response.data as DocOperator[];
      setOperatorList(operatorList);
    }).catch((reason) => {
      console.error(reason);
    });
  }, []);

  useEffect(() => {
    setWaitingApp?.(true);
    axios.get('/authenticate').then((response) => {
      const { data: user } = response;
      setUser?.(user);
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
  }, [getOperatorList, history, setUser, setWaitingApp, url]);

  function onClickSave(record: DocOperator) {
    form.validateFields().then((value) => {
      const { _id } = record;
      const key = (record as any).key;
      const { name, owner } = value;
      const indexFound = operatorList.findIndex((operator) => operator._id === _id);
      if (key === '' || indexFound !== -1) {
        setWaiting(true);
        axios.post(`/operators/${seqValOf(_id)}`, {
          name, owner,
        }).then((response) => {
          getOperatorList().finally(() => {
            setWaiting(false);
          });
        }).catch((reason) => {
          setWaiting(false);
        });
      }
    }).catch((reason) => {
      console.error(reason);
    });
  }

  const dataSource = operatorList.map((operator) => {
    const { _id } = operator;
    return { key: _id, ...operator };
  });
  if (isAdmin(user)) {
    dataSource.unshift({ key: '', name: '', _id: '', owner: '' });
  }

  return (
    <>
      <Title level={3}>Operators</Title>
      <Spin spinning={waiting}>
        <Form form={form} component={false}>
          <Table
            dataSource={dataSource} columns={columns}
            components={{
              body: {
                cell: EditableCell,
              },
            }}
            pagination={false}
          />
        </Form>
      </Spin>
    </>
  )
}

function EditableCell({ record, dataIndex, children, ...props }: any) {
  return (
    <td {...props}>
      {
        record?.key === '' && dataIndex === 'name' ? (
          <Form.Item
            name={dataIndex} rules={[ { required: true }]} help={false}
            style={{ margin: 0 }}
          >
            <Input />
          </Form.Item>
        ) : record?.key === '' && dataIndex === 'owner' ? (
          <Form.Item
            name={dataIndex} rules={[ {required: true }]} help={false}
            style={{ margin: 0 }}
          >
            <Select
              showSearch
              options={dummyOptions}
              filterOption={(input, option) => {
                return (option?.label?.toString() ?? '').toLocaleLowerCase().includes(input.toLocaleLowerCase());
              }}
            />
          </Form.Item>
        ) : record?.key === '' ? (
          <Skeleton.Input style={{ width: 200 }} />
        ) : dataIndex === 'owner' ? (
          <Skeleton.Input style={{ width: 200 }} />
        ) : (
          children
        )
      }
    </td>
  )
}
