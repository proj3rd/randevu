import axios from "axios";
import { DocOperator, DocPackage, DocUser } from "randevu-shared/dist/types";
import { isAdmin } from 'randevu-shared/dist/utils';
import { useEffect, useState } from "react";
import { Button, Container, Dimmer, Header, Label, Loader, Table } from "semantic-ui-react";
import ModalPackageAddMod from "../components/ModalPackageAddMod";

type Props = {
  user: DocUser | undefined;
  onLogout?: () => void;
}

const numCols = 2;

export default function Packages({ user, onLogout }: Props) {
  const [waiting, setWaiting] = useState(false);
  const [open, setOpen] = useState(false);
  const [packageList, setPackageList] = useState<DocPackage[]>([]);
  const [operatorList, setOperatorList] = useState<DocOperator[]>([]);

  useEffect(() => {
    setWaiting(true);
    axios.get('/authenticate').then((response) => {
      axios.get('/operators').then((response) => {
        const { data: operatorList } = response;
        setOperatorList(operatorList);
        return axios.get('/packages?include[]=operator');
      }).then((response) => {
        const { data: packageList } = response;
        setPackageList(packageList);
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

  function onClose() {
    setOpen(false);
  }

  return (
    <Container>
      <Header as='h1'>Packages</Header>
      <Dimmer.Dimmable>
        <Table>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>Name</Table.HeaderCell>
              <Table.HeaderCell>Operator</Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {
              isAdmin(user) ? (
                <Table.Row>
                  <Table.Cell textAlign='center' colSpan={numCols}>
                    <Button onClick={() => setOpen(true)}>Add a package</Button>
                  </Table.Cell>
                </Table.Row>
              ) : (<></>)
            }
            {
              packageList.filter((pkg) => !pkg.main).map((pkgMain) => {
                const { _id, name } = pkgMain;
                return (
                  <>
                    <Table.Row key={_id}>
                      <Table.Cell>
                        <Label ribbon>{name}</Label>
                      </Table.Cell>
                      <Table.Cell />
                    </Table.Row>
                    {
                      packageList.filter((pkg) => pkg.main === _id).map((pkgSub) => {
                        const { _id, name, operator: operator_id } = pkgSub;
                        const operatorFound = operatorList.find((operator) => operator._id === operator_id);
                        return (
                          <Table.Row key={_id}>
                            <Table.Cell>{name}</Table.Cell>
                            <Table.Cell>{operatorFound?.name ?? ''}</Table.Cell>
                          </Table.Row>
                        )
                      })
                    }
                  </>
                )
              })
            }
          </Table.Body>
        </Table>
        <ModalPackageAddMod open={open} onClose={onClose} />
        <Dimmer active={waiting}>
          <Loader />
        </Dimmer>
      </Dimmer.Dimmable>
    </Container>
  );
}
