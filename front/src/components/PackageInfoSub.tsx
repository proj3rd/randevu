import axios from "axios";
import { DocUser } from "randevu-shared/dist/types";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Dimmer, Header, Label, Loader } from "semantic-ui-react";

type Props = {
  user: DocUser | undefined;
};

export default function PackageInfoSub({ user }: Props) {
  const { seqVal } = useParams() as any;

  const [name, setName] = useState('');
  const [waitingName, setWaitingName] = useState(false);

  useEffect(() => {
    setWaitingName(true);
    axios.get(`/packages/sub/${seqVal}`).then((response) => {
      const { name } = response.data;
      setName(name);
    }).catch((reason) => {
      console.error(reason);
    }).finally(() => {
      setWaitingName(false);
    });
  }, [seqVal]);

  return (
    <>
      <Dimmer.Dimmable>
        <Header as='h1'>
          <Header.Subheader>Packages</Header.Subheader>
          {name}
        </Header>
        <Dimmer active={waitingName}>
          <Loader />
        </Dimmer>
      </Dimmer.Dimmable>
      <Label>Operator</Label>
      <Header as='h2'>Deployment options</Header>
      <Header as='h2'>Products</Header>
      <Header as='h2'>Radio access technologies</Header>
      <Header as='h2'>RAN sharing</Header>
    </>
  );
}
