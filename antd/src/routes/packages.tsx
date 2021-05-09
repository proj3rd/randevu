import Title from "antd/lib/typography/Title";
import { DocUser } from "randevu-shared/dist/types";

type Props = {
  user?: DocUser | undefined;
};

export default function Packages({ user }: Props) {
  return (
    <>
      <Title level={3}>Packages</Title>
    </>
  )
}