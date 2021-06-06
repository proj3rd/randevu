import { Breadcrumb, Skeleton } from "antd";
import Title from "antd/lib/typography/Title";
import axios from "axios";
import { DocOperator, DocUser } from "randevu-shared/dist/types";
import { useEffect, useState } from "react";
import { useParams } from "react-router"

type Props = {
  user?: DocUser | undefined;
}

export default function OperatorInfo({ user }: Props) {
  const { seqVal } = useParams<{ seqVal: string }>();

  const [name, setName] = useState('');

  useEffect(() => {
    axios.get(`/operators/${seqVal}`).then((response) => {
      const { _id, name } = response.data as DocOperator;
      setName(name);
    }).catch((reason) => {
      console.error(reason);
    });
  }, []);

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
      <Title level={4}>Packages</Title>
    </>
  );
}
