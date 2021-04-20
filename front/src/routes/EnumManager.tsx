import axios from "axios";
import { config} from 'randevu-shared/dist/config';
import { DocEnum, DocUser } from "randevu-shared/dist/types";
import { isAdmin, seqValOf } from "randevu-shared/dist/utils";
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
  const [editing, setEditing] = useState<string | undefined>(undefined);
  const [nameNew, setNameNew] = useState('');

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

  function onClickEdit(_id: string) {
    const enumFound = enumList.find((enumItem) => enumItem._id === _id);
    if (!enumFound) {
      return;
    }
    setNameNew(enumFound.name);
    setEditing(_id);
  }

  function renameEnum() {
    if (!editing) {
      return;
    }
    setWaiting(true);
    axios.post(`${path}/${seqValOf(editing)}`, {
      name: nameNew,
    }).then((response) => {
      return axios.get(path);
    }).then((response) => {
      const { data: enumList } = response;
      setEnumList(enumList);
    }).catch((reason) => {
      // TODO: What to do?
    }).finally(() => {
      setEditing(undefined);
      setWaiting(false);
    })
  }

  return (
    <Container>
      <Header as='h1'>{title}</Header>
      <Dimmer.Dimmable>
        <Table>
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
                  <Table.Cell collapsing>
                    <Button type='submit' icon='plus' disabled={!enumName} form='addEnum' />
                  </Table.Cell>
                </Table.Row>
              ) : (<></>)
            }
            {
              enumList.map((enumItem) => {
                const { _id, name } = enumItem;
                return (
                  <Table.Row key={_id}>
                    <Table.Cell>
                      {
                        editing === _id ? (
                          <>
                            <Form id='renameEnum' onSubmit={() => renameEnum()}>
                              <Form.Field>
                                <input value={nameNew} onChange={(e) => setNameNew(e.target.value)} />
                              </Form.Field>
                            </Form>
                          </>
                        ) : (<>{name}</>)
                      }
                    </Table.Cell>
                    <Table.Cell collapsing>
                      {
                        editing === _id ? (
                          <>
                            <Button icon='check' onClick={() => renameEnum()} />
                            <Button icon='cancel' onClick={() => setEditing(undefined)} />
                          </>
                        ) : isAdmin(user) ? (
                          <Button icon='edit' onClick={() => onClickEdit(_id)} />
                        ) : (<></>)
                      }
                    </Table.Cell>
                  </Table.Row>
                )
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
