import { Button, Table } from 'antd/lib';
import Title from "antd/lib/typography/Title";
import { DocUser } from "randevu-shared/dist/types";

type Props = {
  user?: DocUser | undefined;
};

export default function Packages({ user }: Props) {
  const columns = [
    { key: 'name', dataIndex: 'name', title: 'Name' },
    { key: 'operator', dataIndex: 'operator', title: 'Operator' },
  ];

  return (
    <>
      <Title level={3}>Packages</Title>
      <Button>Create a package</Button>
      <Table columns={columns}></Table>
    </>
  )
}
