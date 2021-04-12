import axios from "axios";
import { DocPackage, DocUser } from "randevu-shared/dist/types";
import { useEffect, useState } from "react";
import { Container, Dimmer, Header, Label, Loader, Table } from "semantic-ui-react";

type Props = {
  user: DocUser | undefined;
  onLogout?: () => void;
}

export default function Packages({ user, onLogout }: Props) {
  const [waiting, setWaiting] = useState(false);
  const [packageList, setPackageList] = useState<DocPackage[]>([]);

  useEffect(() => {
    setWaiting(true);
    axios.get('/authenticate').then((response) => {
      axios.get('/packages').then((response) => {
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

  return (
    <Container>
      <Header as='h1'>Packages</Header>
      <Dimmer.Dimmable>
        <Table>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>Name</Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {
              packageList.filter((pkg) => !pkg.main).map((pkgMain) => {
                const { _id, name } = pkgMain;
                return (
                  <>
                    <Table.Row key={_id}>
                      <Table.Cell>
                        <Label ribbon>{name}</Label>
                      </Table.Cell>
                    </Table.Row>
                    {
                      packageList.filter((pkg) => pkg.main === _id).map((pkgSub) => {
                        const { _id, name } = pkgSub;
                        return (
                          <Table.Row key={_id}>
                            <Table.Cell>{name}</Table.Cell>
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
        <Dimmer active={waiting}>
          <Loader />
        </Dimmer>
      </Dimmer.Dimmable>
    </Container>
  );
}
