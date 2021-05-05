import { Form, Input, Table, Typography } from "antd";
import { CheckOutlined, CloseOutlined, EditOutlined } from '@ant-design/icons'
import { DocEnum } from "randevu-shared/dist/types";
import { useState } from "react";

type Props = {
  dataSource?: any[];
}

export default function EnumTable({ dataSource }: Props) {
  const [form] = Form.useForm();
  const [editingKey, setEditingKey] = useState('');

  const columns: any[] = [
    {
      key: 'name', dataIndex: 'name', title: 'Name',
      width: '75%',
      editable: true,
    },
    {
      key: 'actions', dataIndex: 'actions', title: 'Actions',
      width: '25%',
      render: (_: any, record: any) => {
        return isEditing(record) ? (
          <>
            <Typography.Link>
              <CheckOutlined /> Save
            </Typography.Link>
            {' '}
            <Typography.Link onClick={() => setEditingKey('')}>
              <CloseOutlined /> Cancel
            </Typography.Link>
          </>
        ) : (
          <Typography.Link onClick={() => onClickEdit(record)} disabled={editingKey !== ''}>
            <EditOutlined /> Edit
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
        editing: isEditing(record),
      }),
    }
  });

  function isEditing(record: any) {
    return editingKey === record.key;
  }

  function onClickEdit(record: DocEnum) {
    const { name } = record
    const key = (record as any).key;
    form.setFieldsValue({ name });
    setEditingKey(key);
  }

  return (
    <Form
      form={form}
      component={false}
    >
      <Table
        dataSource={dataSource} columns={columns}
        components={{
          body: {
            cell: EditableCell,
          },
        }}
      ></Table>
    </Form>
  );
}

function EditableCell({ record, dataIndex, editing, children, ...props }: any) {
  return (
    <td {...props}>
      {
        editing ? (
          <Form.Item
            name={dataIndex} rules={[ { required: true }]}
            style={{ margin: 0 }}
          >
            <Input />
          </Form.Item>
        ) : (
          children
        )
      }
    </td>
  )
}
