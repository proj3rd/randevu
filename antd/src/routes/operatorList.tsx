import { Form, Input, Skeleton, Table, Typography } from "antd";
import Title from "antd/lib/typography/Title";
import { CheckOutlined } from '@ant-design/icons';
import axios from "axios";
import { DocOperator, DocUser } from "randevu-shared/dist/types";
import { isAdmin, seqValOf } from "randevu-shared/dist/utils";
import { useCallback, useEffect, useState } from "react";
import DebounceSelect from "../components/debounceSelect";
import { getUserListForSelect } from "../utils";

type Props = {
  user?: DocUser | undefined;
}

export default function OperatorList({ user }: Props) {
  const [waiting, setWaiting] = useState(false);
  const [form] = Form.useForm();
  const [operatorList, setOperatorList] = useState<DocOperator[]>([]);
  const [ownerList, setOwnerList] = useState<DocUser[]>([]);

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
        owner: ownerList.find((owner) => owner._id === record.owner)?.username,
      }),
    }
  });

  const getOperatorList = useCallback(async () => {
    return axios.get('/operators', {
      params: {
        include: ['owner'],
      },
    }).then(async (response) => {
      const operatorList = response.data as DocOperator[];
      setOperatorList(operatorList);
      const ownerList = Array.from(
        new Set(
          operatorList
            .map((operator) => seqValOf(operator.owner ?? ""))
            .filter((owner) => !!owner)
        )
      );
      axios.get('/users', {
        params: {
          seqVal: ownerList,
        },
      }).then((response) => {
        const ownerList = response.data as DocUser[];
        setOwnerList(ownerList);
      }).catch((reason) => {
        console.error(reason);
      });
    }).catch((reason) => {
      console.error(reason);
    });
  }, []);

  useEffect(() => {
    setWaiting(true);
    getOperatorList().finally(() => {
      setWaiting(false);
    });
  }, [getOperatorList]);

  function onClickSave(record: DocOperator) {
    form.validateFields().then((value) => {
      const { _id } = record;
      const { name, owner } = value;
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
      <Form form={form} component={false}>
        <Table
          dataSource={dataSource} columns={columns}
          components={{
            body: {
              cell: EditableCell,
            },
          }}
          pagination={false}
          loading={waiting}
        />
      </Form>
    </>
  )
}

function EditableCell({ record, dataIndex, owner, children, onChangeOwner, ...props }: any) {
  const { _id, name } = record ?? {};
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
            <DebounceSelect
              showSearch
              filterOption={(input, option) => {
                return (option?.label?.toString() ?? '').toLocaleLowerCase().includes(input.toLocaleLowerCase());
              }}
              fetchFunc={getUserListForSelect}
              timeout={500}
            />
          </Form.Item>
        ) : dataIndex === 'owner' ? (
          owner ?? <Skeleton.Input style={{ width: 200 }} />
        ) : dataIndex === 'name' ? (
          <Typography.Link href={`/operators/${seqValOf(_id)}`}>
            {name}
          </Typography.Link>
        ) : (
          children
        )
      }
    </td>
  )
}
