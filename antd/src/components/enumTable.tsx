import { Form, Input, Skeleton, Table, Typography } from "antd";
import { CheckOutlined, CloseOutlined, EditOutlined } from '@ant-design/icons'
import { DocEnum, DocUser } from "randevu-shared/dist/types";
import { useState } from "react";
import { isAdmin } from "randevu-shared/dist/utils";

type Props = {
  enumList: DocEnum[];
  user?: DocUser;
  onChangeEnum: (_id: string, name: string) => Promise<void | Error>;
}

export default function EnumTable({ enumList, user, onChangeEnum }: Props) {
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
        const editable = isEditing(record);
        return !isAdmin(user) ? (
          <></>
        ) : record.key === '' ? (
          <Typography.Link onClick={() => onClickSave(record)} disabled={!editable}>
            <CheckOutlined /> Save
          </Typography.Link>
        ) : !editable ? (
          <Typography.Link onClick={() => onClickEdit(record)} disabled={editingKey !== ''}>
            <EditOutlined /> Edit
          </Typography.Link>
        ) : (
          <>
            <Typography.Link onClick={() => onClickSave(record)}>
              <CheckOutlined /> Save
            </Typography.Link>
            {' '}
            <Typography.Link onClick={() => onClickCancel()}>
              <CloseOutlined /> Cancel
            </Typography.Link>
          </>
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

  function onClickCancel() {
    form.setFieldsValue({ name: '' });
    setEditingKey('');
  }

  function onClickEdit(record: DocEnum) {
    const { name } = record
    const key = (record as any).key;
    form.setFieldsValue({ name });
    setEditingKey(key);
  }

  async function onClickSave(record: any) {
    form.validateFields().then((value) => {
      const { key, _id } = record;
      const { name } = value;
      const indexFound = enumList.findIndex((enumItem) => enumItem._id === _id);
      if (key === '' || indexFound !== -1) {
        onChangeEnum(_id, name).then((result) => {
          if (!(result instanceof Error)) {
            onClickCancel();
          }
        });
      }
    }).catch((reason) => {
      console.error(reason);
    });
  }

  const dataSource = [
    // { key: '', name: '' },
    ...enumList.map((enumItem) => {
      const { _id } = enumItem;
      return { key: _id, ...enumItem };
    }),
  ];
  if (isAdmin(user)) {
    dataSource.unshift({ key: '', name: '', _id: '' });
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
        pagination={false}
      />
    </Form>
  );
}

function EditableCell({ record, dataIndex, editing, children, ...props }: any) {
  return (
    <td {...props}>
      {
        editing ? (
          <Form.Item
            name={dataIndex} rules={[ { required: true }]} help={false}
            style={{ margin: 0 }}
          >
            <Input />
          </Form.Item>
        ) : record?.key === '' ? (
          <Skeleton.Input style={{ width: 200 }} />
        ) : (
          children
        )
      }
    </td>
  )
}
