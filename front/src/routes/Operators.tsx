import axios from "axios";
import { DocOperator, DocUser } from "randevu-shared/dist/types";
import React, { useEffect, useState } from "react";
import { Button, Container, Dimmer, DropdownItemProps, DropdownProps, Form, Header, Loader, Select, Table } from "semantic-ui-react";

type Props = {
  user: DocUser | undefined;
  onLogout?: () => void;
};

const numCols = 3;

export default function Operators({ user, onLogout }: Props) {
  const [waiting, setWaiting] = useState(false);
  const [name, setName] = useState('');
  const [userList, setUserList] = useState<DropdownItemProps[]>([]);
  const [owner, setOwner] = useState<string>('');
  const [operatorList, setOperatorList] = useState<DocOperator[]>([]);

  useEffect(() => {
    setWaiting(true);
    axios.get('/authenticate').then((response) => {
      axios.get('/users').then((response) => {
        const { data: userList } = response;
        setUserList(userList.map((user: DocUser) => {
          const { _id, username } = user;
          return { key: _id, value: _id, text: username };
        }));
        return axios.get('/operators?include[]=owner');
      }).then((response) => {
        const { data: operatorList } = response;
        setOperatorList(operatorList);
      }).catch((reason) => {
        console.error(reason);
      }).finally(() => {
        setWaiting(false);
      });
    }).catch((reason) => {
      console.error(reason);
      onLogout && onLogout();
    });
  }, [onLogout]);

  function addOperator() {
    if (!name || !owner) {
      return;
    }
    setWaiting(true);
    axios.post('/operators', { name, owner }).then((response) => {
      return axios.get('/operators');
    }).then((response) => {
      const { data: operatorList } = response;
      setOperatorList(operatorList);
    }).catch((reason) => {
      console.error(reason);
    }).finally(() => {
      setWaiting(false);
    });
  }

  function onChangeOwner(e: React.SyntheticEvent<HTMLElement, Event>, data: DropdownProps) {
    setOwner(data.value as string);
  }

  return (
    <Container>
      <Header as='h1'>Operators</Header>
      <Dimmer.Dimmable>
        <Table>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell colSpan={numCols}>Name</Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {
              user && user.role === 'admin' ? (
                <Table.Row>
                  <Table.Cell>
                    <Form id='addOperator' onSubmit={addOperator}>
                      <Form.Field>
                        <input value={name} onChange={(e) => setName(e.target.value)} />
                      </Form.Field>
                    </Form>
                  </Table.Cell>
                  <Table.Cell>
                    <Form>
                      <Form.Field inline>
                        <Select
                          search placeholder='Owner'
                          options={userList}
                          onChange={onChangeOwner}
                        />
                      </Form.Field>
                    </Form>
                  </Table.Cell>
                  <Table.Cell>
                    <Button type='submit' icon='plus' form='addOperator' disabled={!name || !owner} />
                  </Table.Cell>
                </Table.Row>
              ) : (<></>)
            }
            {
              operatorList.map((operator) => {
                const { _id, name } = operator;
                return (
                  <Table.Row key={_id}>
                    <Table.Cell colSpan={numCols}>{name}</Table.Cell>
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