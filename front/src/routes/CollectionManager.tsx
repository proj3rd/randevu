import axios from "axios";
import { config} from 'randevu-shared/dist/config';
import { DocEnum, User } from "randevu-shared/dist/types";
import { useEffect, useState } from "react";
import { Button, Container, Dimmer, Form, Header, Loader, Table } from "semantic-ui-react";

type Props = {
  title: string;
  path: string;
  user: User | undefined;
};

const { api } = config;
axios.defaults.baseURL =`http://${api.host}:${api.port}`;
axios.defaults.withCredentials = true;

export default function CollectionManager({ title, path, user }: Props) {
  const [enumName, setEnumName] = useState('');
  const [waiting, setWaiting] = useState(false);
  const [enumList, setEnumList] = useState<DocEnum[]>([]);

  useEffect(() => {
    setWaiting(true);
    axios.get(path).then((response) => {
      const { data: enumList } = response;
      setEnumList(enumList);
    }).catch((reason) => {
      console.error(reason);
    }).finally(() => {
      setWaiting(false);
    });
  }, [path]);

  return (
    <Container>
      <Header as='h1'>{title}</Header>
      <Dimmer.Dimmable>
        <Table compact>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell colSpan={2}>Name</Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {
              user && user.role === 'admin' ? (
                <Table.Row>
                  <Table.Cell>
                    <Form>
                      <Form.Field>
                        <input value={enumName} onChange={(e) => setEnumName(e.target.value)} />
                      </Form.Field>
                    </Form>
                  </Table.Cell>
                  <Table.Cell>
                    <Button icon='plus' disabled={!enumName} />
                  </Table.Cell>
                </Table.Row>
              ) : (<></>)
            }
            {
              enumList.map((enumItem) => (
                <Table.Row key={enumItem._key}>
                  <Table.Cell colSpan={2}>{enumItem.name}</Table.Cell>
                </Table.Row>
              ))
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
