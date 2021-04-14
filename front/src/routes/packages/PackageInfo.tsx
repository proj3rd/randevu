import axios from "axios";
import { DocUser } from "randevu-shared/dist/types";
import { useEffect, useState } from "react";
import { useParams } from "react-router";
import { Dimmer, Header, Label, Loader } from "semantic-ui-react";

type Props = {
  user: DocUser | undefined;
  type: 'main' | 'sub';
};

export default function PackageInfo({ user, type }: Props) {
  const { seqVal } = useParams() as any;

  const [waiting, setWaiting] = useState(false);
  const [name, setName] = useState('');

  useEffect(() => {
    setWaiting(true);
    axios.get(`/packages/${type}/${seqVal}`).then((response) => {
      const { name } = response.data;
      setName(name);
    }).catch((reason) => {
      console.error(reason);
    }).finally(() => {
      setWaiting(false);
    })
  }, [type, seqVal]);

  return (
    <Dimmer.Dimmable>
      <Header as='h1'>
        <Header.Subheader>Packages</Header.Subheader>
        {name}
      </Header>
      <Label>Operator</Label>
      {
        type === 'sub' ? (
          <>
            <Header as='h2'>Deployment options</Header>
            <Header as='h2'>Products</Header>
            <Header as='h2'>Radio access technologies</Header>
            <Header as='h2'>RAN sharing</Header>
          </>
        ) : (<></>)
      }
      <Dimmer active={waiting}>
        <Loader />
      </Dimmer>
    </Dimmer.Dimmable>
  );
}
