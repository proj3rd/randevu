import axios from "axios";
import { useState } from "react";
import { Button, Form, Table } from "semantic-ui-react";
import { config } from 'randevu-shared/dist/config';

type Props = {
  path: string;
};

const { api } = config;
axios.defaults.baseURL = `http://${api.host}:${api.port}`;
axios.defaults.withCredentials = true;

function EnumManager({ path }: Props) {
  const [enumList, setEnumList] = useState<string[]>(['Enum A', 'Enum B', 'Enum C']);
  const [enumName, setEnumName] = useState('');

  function addEnum() {
    if (enumList.includes(enumName)) {
      return;
    }
    axios.post(path, { enumName }).then(() => {
      setEnumList([...enumList, enumName])
      setEnumName('');
    }).catch((reason) => {
      console.error(reason);
    });
  }

  function onChangeEnumName(e: React.ChangeEvent<HTMLInputElement>) {
    setEnumName(e.target.value);
  }

  function removeEnum(enumName: string) {
    const index = enumList.indexOf(enumName);
    if (index === -1) {
      return;
    }
    axios.delete(`${path}/${enumName}`).then(() => {
      setEnumList([...enumList.slice(0, index), ...enumList.slice(index + 1)]);
    }).catch((reason) => {
      console.error(reason);
    });
  }

  return (
    <>
      <Table>
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
                <Form.Field>
                  <input type='text' value={enumName} onChange={onChangeEnumName} />
                </Form.Field>
              </Form>
            </Table.Cell>
            <Table.Cell>
              <Button icon='plus' onClick={addEnum} />
            </Table.Cell>
          </Table.Row>
          {
            enumList.map((enumName) => {
              return (
                <Table.Row key={enumName}>
                  <Table.Cell>{enumName}</Table.Cell>
                  <Table.Cell>
                    <Button icon='edit' />
                    <Button icon='trash' onClick={() => removeEnum(enumName)} />
                  </Table.Cell>
                </Table.Row>
              )
            })
          }
        </Table.Body>
      </Table>
    </>
  );
}

export default EnumManager;
