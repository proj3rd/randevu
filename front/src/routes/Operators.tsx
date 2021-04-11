import axios from "axios";
import { DocOperator, User } from "randevu-shared/dist/types";
import { useEffect, useState } from "react";
import { Container, Dimmer, Header, Loader, Table } from "semantic-ui-react";

type Props = {
  user: User | undefined;
  onLogout?: () => void;
};

export default function Operators({ user, onLogout }: Props) {
  const [waiting, setWaiting] = useState(false);
  const [operatorList, setOperatorList] = useState<DocOperator[]>([]);

  useEffect(() => {
    setWaiting(true);
    axios.get('/authenticate').then((response) => {
      axios.get('/operators?include[]=owner').then((response) => {
        const { data: operatorList } = response;
        setOperatorList(operatorList);
      }).catch((reason) => {
        console.error(reason);
      });
    }).catch((reason) => {
      console.error(reason);
      onLogout && onLogout();
    }).finally(() => {
      setWaiting(false);
    });
  }, [onLogout]);

  return (
    <Container>
      <Header as='h1'>Operators</Header>
      <Dimmer.Dimmable>
        <Table>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell colSpan={2}>Name</Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {
              operatorList.map((operator) => {
                const { _key, name } = operator;
                return (
                  <Table.Row key={_key}>
                    <Table.Cell colSpan={2}>{name}</Table.Cell>
                  </Table.Row>
                );
              })
            }
          </Table.Body>
        </Table>
        <Dimmer active={waiting}>
          <Loader />
        </Dimmer>
      </Dimmer.Dimmable>
    </Container>
  );
}