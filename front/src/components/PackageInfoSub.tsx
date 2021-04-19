import axios from "axios";
import { DocOperator, DocUser } from "randevu-shared/dist/types";
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
  const [operator, setOperator] = useState<DocOperator | undefined>(undefined);
  const [waitingOperator, setWaitingOperator] = useState(false);

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

    setWaitingOperator(true);
    axios.get(`/packages/sub/${seqVal}/operator`).then((response) => {
      const { data: operator } = response;
      setOperator(operator);
    }).catch((reason) => {
      console.error(reason);
    }).finally(() => {
      setWaitingOperator(false);
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
      <Dimmer.Dimmable>
        <Label>{operator ? operator.name : ''}</Label>
        <Dimmer active={waitingOperator}>
          <Loader />
        </Dimmer>
      </Dimmer.Dimmable>
      <Header as='h2'>Deployment options</Header>
      <Header as='h2'>Products</Header>
      <Header as='h2'>Radio access technologies</Header>
      <Header as='h2'>RAN sharing</Header>
    </>
  );
}
