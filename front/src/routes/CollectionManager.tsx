import axios from "axios";
import { config} from 'randevu-shared/dist/config';
import { DocEnum } from "randevu-shared/dist/types";
import { useEffect, useState } from "react";
import { Button, Container, Dimmer, Header, Loader, Table } from "semantic-ui-react";

type Props = {
  title: string;
  path: string;
};

const { api } = config;
axios.defaults.baseURL =`http://${api.host}:${api.port}`;
axios.defaults.withCredentials = true;

export default function CollectionManager({ title, path }: Props) {
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
