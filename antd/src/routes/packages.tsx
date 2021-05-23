import { Button, Form, Input, Pagination, Select, Skeleton, Table, Typography } from 'antd/lib';
import Title from "antd/lib/typography/Title";
import { SearchOutlined } from '@ant-design/icons';
import axios from 'axios';
import { DocOperator, DocPackage, DocUser } from "randevu-shared/dist/types";
import { useEffect, useState } from 'react';
import { useHistory, useRouteMatch } from 'react-router';
import { useForm } from 'antd/lib/form/Form';
import ModalCreatePackage from '../components/modalCreatePackage';
import { seqValOf } from 'randevu-shared/dist/utils';

type Props = {
  user?: DocUser | undefined;
  setUser?: (user: DocUser | undefined) => void;
  setWaiting?: (waiting: boolean) => void;
};

type Query = {
  per?: number;
  page?: number;
};

const PER = 3;

export default function Packages({ user, setUser, setWaiting: setWaitingApp }: Props) {
  const history = useHistory();
  const { url } = useRouteMatch();

  const [waiting, setWaiting] = useState(false);
  const [isModalVisible, setModalVisible] = useState(false);
  const [form] = useForm();
  const [packageList, setPackageList] = useState<DocOperator[]>([]);
  const [pageCurrent, setPageCurrent] = useState(1);
  const [pageTotal, setPageTotal] = useState(0);
  const [operatorList, setOperatorList] = useState<DocOperator[]>([]);

  const columns: any[] = [
    { key: 'name', dataIndex: 'name', title: 'Name', editable: true, width: '40%' },
    { key: 'operator', dataIndex: 'operator', title: 'Operator', editable: true, width: '20%' },
    { key: 'owner', dataIndex: 'owner', title: 'Owner', editable: true, width: '20%' },
    {
      key: 'actions', dataIndex: 'actions', title: 'Actions', width: '20%',
      render: (_: any, record: any) => {
        return record.key === '' ? (
          <Typography.Link onClick={onClickSearch}>
            <SearchOutlined /> Search
          </Typography.Link>
        ) : (null);
      }
    },
  ].map((column) => {
    const { dataIndex, editable } = column;
    if (!editable) {
      return column;
    }
    return {
      ...column,
      onCell: (record: any) => {
        const editableCellProps: EditableCellProps = {
          record,
          dataIndex,
          operator: operatorList.find((operator) => operator._id === record.operator)?.name,
          operatorList,
        };
        return editableCellProps;
      },
    }
  });

  useEffect(() => {
    setWaitingApp?.(true);
    axios.get('/authenticate').then((response) => {
      const { data: user } = response;
      setUser?.(user);
      axios.get('/operators').then((response) => {
        const operatorList = response.data as DocOperator[];
        operatorList.sort((firstOperator, secondOperator) => {
          return firstOperator.name.localeCompare(secondOperator.name);
        });
        setOperatorList(operatorList);
      });
    }).catch((reason) => {
      console.error(reason);
      setUser?.(undefined);
      history.push(`/login?redirect=${url}`);
    }).finally(() => {
      setWaitingApp?.(false);
    });
  }, [history, setUser, setWaitingApp, url]);

  async function getPackageList(query?: Query) {
    const params = {
      per: PER,
      page: 1,
      ...query, // If `query` includes `page`, it will override the above `page`
      name: form.getFieldValue('name') ? [form.getFieldValue('name')] : undefined,
      operator: form.getFieldValue('operator')?.map((operatorId: string) => seqValOf(operatorId)) ?? [],
    };
    return axios.get('/packages', { params }).then((response) => {
      const packageList = response.data.packageList as DocPackage[];
      const packageListOrdered: DocPackage[] = packageList.filter((pkg) => !pkg.main);
      for (let i = packageListOrdered.length - 1; i >= 0; i -= 1) {
        const { _id } = packageListOrdered[i];
        const packageListFiltered = packageList.filter((pkg) => pkg.main === _id);
        packageListOrdered.splice(i + 1, 0, ...packageListFiltered);
      }
      const { countMain } = response.data;
      setPackageList(packageListOrdered);
      setPageCurrent(params.page);
      setPageTotal(countMain);
    }).catch((reason) => {
      console.error(reason);
    });
  }

  function onCancelModalCreatePackage() {
    setModalVisible(false);
  }

  function onChangePagination(page: number, pageSize?: number | undefined) {
    if (page === pageCurrent) {
      return;
    }
    setWaiting(true);
    getPackageList({ page }).finally(() => {
      setWaiting(false);
    });
  }

  function onClickSearch() {
    setWaiting(true);
    getPackageList().finally(() => {
      setWaiting(false);
    });
  }

  function onOkModalCreatePackage() {
    // TODO
  }

  const dataSource = packageList.map((pkg) => {
    const { _id } = pkg;
    return { key: _id, ...pkg };
  });
  dataSource.unshift({ key: '' } as any);

  return (
    <>
      <Title level={3}>Packages</Title>
      <Button onClick={() => setModalVisible(true)}>Create a package</Button>
      <Pagination
        pageSize={PER}
        current={pageCurrent}
        total={pageTotal}
        showSizeChanger={false}
        showTotal={(total, range) => `${range[0]}-${range[1]} of ${pageTotal} main packages`}
        onChange={onChangePagination}
        style={{
          display: 'flex', justifyContent: 'flex-end',
          marginTop: '1em', marginBottom: '1em'
        }}
      />
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
          pagination={false}
        />
      </Form>
      <Pagination
        pageSize={PER}
        current={pageCurrent}
        total={pageTotal}
        showSizeChanger={false}
        showTotal={(total, range) => `${range[0]}-${range[1]} of ${pageTotal} main packages`}
        onChange={onChangePagination}
        style={{
          display: 'flex', justifyContent: 'flex-end',
          marginTop: '1em', marginBottom: '1em'
        }}
      />
      <ModalCreatePackage
        visible={isModalVisible}
        onCancel={onCancelModalCreatePackage}
        onOk={onOkModalCreatePackage}
      />
    </>
  )
}

type EditableCellProps = {
  record?: any;
  dataIndex: string;
  operator?: string;
  operatorList?: DocOperator[];
  children?: React.DetailedHTMLProps<React.TdHTMLAttributes<HTMLTableDataCellElement>, HTMLTableDataCellElement>;
};

function EditableCell({
  record,
  dataIndex,
  operator,
  operatorList,
  children,
  ...props
}: EditableCellProps) {
  return (
    <td {...props}>
      {record?.key === "" && dataIndex === "name" ? (
        <Form.Item name={dataIndex} help={false} style={{ margin: 0 }}>
          <Input />
        </Form.Item>
      ) : record?.key === "" && dataIndex === "operator" ? (
        <Form.Item name={dataIndex} help={false} style={{ margin: 0 }}>
          <Select
            mode="multiple"
            allowClear
          >
            {operatorList
              ? operatorList.map((operator) => {
                  const { _id, name } = operator;
                  return (
                    <Select.Option key={_id} value={_id}>
                      {name}
                    </Select.Option>
                  );
                })
              : null}
          </Select>
        </Form.Item>
      ) : record?.key === "" && dataIndex === "owner" ? (
        <Skeleton.Input style={{ width: 200 }} />
      ) : dataIndex === "operator" ? (
        operator ?? <Skeleton.Input style={{ width: 200 }} />
      ) : (
        children
      )}
    </td>
  );
}