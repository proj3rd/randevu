import Title from "antd/lib/typography/Title";
import { DocUser } from "randevu-shared/dist/types";

type Props = {
  user?: DocUser | undefined;
  setUser?: (user: DocUser | undefined) => void;
  setWaiting?: (waiting: boolean) => void;
};

export default function Regions({ user, setUser, setWaiting: setWaitingApp }: Props) {
  return (
    <>
      <Title level={3}>Regions</Title>
    </>
  )
}
