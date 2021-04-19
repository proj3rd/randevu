import { DocOperator, DocPackage, DocUser } from "randevu-shared/dist/types";
import { isAdmin, seqValOf } from "randevu-shared/dist/utils";
import { useState } from "react";
import { Link, useRouteMatch } from "react-router-dom";
import { Button, Label, Table } from "semantic-ui-react";
import ModalPackageAddMod from "./ModalPackageAddMod";

type Props = {
  packageList: DocPackage[];
  operatorList: DocOperator[];
  user?: DocUser | undefined;
  onAdd?: () => void;
};

const numCols = 2;

export default function PackageTable({ packageList, operatorList, user, onAdd: onAddParent }: Props) {
  const [open, setOpen] = useState(false);

  function onAdd() {
    setOpen(false);
    onAddParent?.();
  }

  function onClose() {
    setOpen(false);
  }

  return (
    <>
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
          packageList.map((pkg) => {
            const { _id, name, main, operator: operator_id } = pkg;
            const operatorFound = operatorList.find((operator) => operator._id === operator_id);
            return (
              <>
                <Table.Row key={_id}>
                  <Table.Cell>
                    {
                      !main ? (
                        <Label ribbon>
                          <Link to={`/packages/main/${seqValOf(_id)}`}>{name}</Link>
                        </Label>
                      ) : (
                        <Link to={`/packages/sub/${seqValOf(_id)}`}>{name}</Link>
                      )
                    }
                  </Table.Cell>
                  <Table.Cell>
                    {operatorFound?.name ?? ''}
                  </Table.Cell>
                </Table.Row>
              </>
            )
          })
        }
      </Table.Body>
    </Table>
    <ModalPackageAddMod open={open} onClose={onClose} onAdd={onAdd} />
    </>
  );
}
