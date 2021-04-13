import { DocUser } from "randevu-shared/dist/types";
import { useState } from "react";
import { useParams } from "react-router";
import { Dimmer, Header, Loader } from "semantic-ui-react";

type Props = {
  user: DocUser | undefined;
}

export default function PackageInfo({ user }: Props) {
  const { seqVal } = useParams() as any;

  const [waiting, setWaiting] = useState(false);

  return (
    <Dimmer.Dimmable>
      <Header as='h2'>{seqVal}</Header>
      <Dimmer active={waiting}>
        <Loader />
      </Dimmer>
    </Dimmer.Dimmable>
  );
}
