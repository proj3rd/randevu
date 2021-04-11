import axios from "axios";
import { config} from 'randevu-shared/dist/config';
import { DocEnum, DocUser } from "randevu-shared/dist/types";
import { useEffect, useState } from "react";
import { Button, Container, Dimmer, Form, Header, Loader, Message, Table } from "semantic-ui-react";

type Props = {
  title: string;
  path: string;
  user: DocUser | undefined;
  onLogout?: () => void;
};

const { api } = config;
axios.defaults.baseURL =`http://${api.host}:${api.port}`;
axios.defaults.withCredentials = true;

export default function EnumManager({ title, path, user, onLogout }: Props) {
  const [enumName, setEnumName] = useState('');
  const [waiting, setWaiting] = useState(false);
  const [messageVisible, setMessageVisible] = useState(false);
  const [messageContent, setMessageContent] = useState('');
  const [enumList, setEnumList] = useState<DocEnum[]>([]);

  function addEnum() {
    if (!enumName) {
      return;
    }
    setWaiting(true);
    axios.post(path, { name: enumName }).then((response) => {
      return axios.get(path);
    }).then((response) => {
      const { data: enumList } = response;
      setEnumList(enumList);
      setMessageVisible(false);
    }).catch((reason) => {
      console.error(reason);
      setMessageContent('Oops. Something went wrong. Please try again later');
      setMessageVisible(true);
    }).finally(() => {
      setWaiting(false);
    });
  }

  useEffect(() => {
    setWaiting(true);
    axios.get('/authenticate').then((response) => {
      axios.get(path).then((response) => {
        const { data: enumList } = response;
        setEnumList(enumList);
      }).catch((reason) => {
        console.error(reason);
      }).finally(() => {
        setWaiting(false);
      });
    }).catch((reason) => {
      console.error(reason);
      onLogout && onLogout();
    });
  }, [path, onLogout]);

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
                <Table.Row verticalAlign='top'>
                  <Table.Cell>
                    <Form id='addEnum' onSubmit={addEnum}>
                      <Form.Field>
                        <input value={enumName} onChange={(e) => setEnumName(e.target.value)} />
                      </Form.Field>
                    </Form>
                    {
                      messageVisible ? (
                        <Message visible negative>{messageContent}</Message>
                      ) : (<></>)
                    }
                  </Table.Cell>
                  <Table.Cell>
                    <Button type='submit' icon='plus' disabled={!enumName} form='addEnum' />
                  </Table.Cell>
                </Table.Row>
              ) : (<></>)
            }
            {
              enumList.map((enumItem) => (
                <Table.Row key={enumItem._id}>
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
