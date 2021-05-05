import { Table } from "antd";

type Props = {
  dataSource?: any[];
}

const columns = [
  { key: 'name', dataIndex: 'name', title: 'Name' },
]

export default function EnumTable({ dataSource }: Props) {
  return (
    <Table dataSource={dataSource} columns={columns}></Table>
  );
}
