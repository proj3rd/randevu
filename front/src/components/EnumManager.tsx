import axios from "axios";
import { useEffect, useState } from "react";
import { Button, Dimmer, Form, Loader, Table } from "semantic-ui-react";
import { config } from 'randevu-shared/dist/config';

type Props = {
  path: string;
};

const { api } = config;
axios.defaults.baseURL = `http://${api.host}:${api.port}`;
axios.defaults.withCredentials = true;

function EnumManager({ path }: Props) {
  const [loading, setLoading] = useState(false);
  const [enumList, setEnumList] = useState<string[]>([]);
  const [enumName, setEnumName] = useState('');
  const [enumNameNew, setEnumNameNew] = useState('');
  const [editing, setEditing] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    axios.get(path).then((value) => {
      setEnumList(value.data);
    }).catch((reason) => {
      console.error(reason);
    }).finally(() => {
      setLoading(false);
    });
  }, [path]);

  function addEnum() {
    if (enumList.includes(enumName)) {
      return;
    }
    setLoading(true);
    axios.post(path, { name: enumName }).then(() => {
      setEnumList([...enumList, enumName])
      setEnumName('');
    }).catch((reason) => {
      console.error(reason);
    }).finally(() => {
      setLoading(false);
    });
  }

  function onChangeEnumName(e: React.ChangeEvent<HTMLInputElement>) {
    setEnumName(e.target.value);
  }

  function onChangeEnumNameNew(e: React.ChangeEvent<HTMLInputElement>) {
    setEnumNameNew(e.target.value);
  }

  function removeEnum(enumName: string) {
    const index = enumList.indexOf(enumName);
    if (index === -1) {
      return;
    }
    setLoading(true);
    axios.delete(`${path}/${enumName}`).then(() => {
      setEnumList([...enumList.slice(0, index), ...enumList.slice(index + 1)]);
    }).catch((reason) => {
      console.error(reason);
    }).finally(() => {
      setLoading(false);
    });
  }

  function renameEnum(enumName: string, enumNameNew: string) {
    setLoading(true);
    axios.post(`${path}/${enumName}`, { nameNew: enumNameNew }).then(() => {
      const index = enumList.indexOf(enumName);
      if (index === -1) {
        return;
      }
      setEnumList([...enumList.slice(0, index), enumNameNew, ...enumList.slice(index + 1)]);
    }).catch((reason) => {
      console.error(reason);
    }).finally(() => {
      setLoading(false);
    });
  }

  return (
    <>
      <Dimmer.Dimmable>
        <Table celled selectable>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>Name</Table.HeaderCell>
              <Table.HeaderCell singleLine>Actions</Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            <Table.Row>
              <Table.Cell>
                <Form onSubmit={addEnum}>
                  <Form.Field disabled={!!editing}>
                    <input type='text' value={enumName} onChange={onChangeEnumName} />
                  </Form.Field>
                </Form>
              </Table.Cell>
              <Table.Cell>
                <Button icon='plus' onClick={addEnum} disabled={!!editing} />
              </Table.Cell>
            </Table.Row>
            {
              enumList.map((enumName) => {
                return (
                  <Table.Row key={enumName}>
                    {
                      editing !== enumName ? (
                        <>
                          <Table.Cell>{enumName}</Table.Cell>
                          <Table.Cell>
                            <Button icon='edit' onClick={() => {
                              setEnumNameNew(enumName);
                              setEditing(enumName);
                            }} />
                            <Button icon='trash' onClick={() => removeEnum(enumName)} />
                          </Table.Cell>
                        </>
                      ) : (
                        <>
                          <Table.Cell>
                            <Form>
                              <Form.Field>
                                <input type='text' value={enumNameNew} onChange={onChangeEnumNameNew} />
                              </Form.Field>
                            </Form>
                          </Table.Cell>
                          <Table.Cell>
                            <Button icon='check' onClick={() => renameEnum(enumName, enumNameNew)} />
                            <Button icon='cancel' onClick={() => setEditing(null)} />
                          </Table.Cell>
                        </>
                      )
                    }
                  </Table.Row>
                )
              })
            }
          </Table.Body>
        </Table>
        <Dimmer active={loading}>
          <Loader />
        </Dimmer>
      </Dimmer.Dimmable>
    </>
  );
}

export default EnumManager;
