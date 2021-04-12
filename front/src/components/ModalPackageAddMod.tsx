import axios from "axios";
import { DocPackage } from "randevu-shared/dist/types";
import { useEffect, useState } from "react";
import { Button, Dimmer, Divider, DropdownItemProps, Form, Loader, Modal, ModalProps, Select } from "semantic-ui-react";

type Props = {} & ModalProps;

export default function ModalPackageAddMod({ ...modalProps }: Props) {
  const { onClose } = modalProps;

  const [waiting, setWaiting] = useState(false);
  const [packageMainList, setPackageMainList] = useState<DropdownItemProps[]>([]);
  const [userList, setUserList] = useState<DropdownItemProps[]>([]);
  const [packageSubList, setPackageSubList] = useState<DropdownItemProps[]>([]);

  const [name, setName] = useState('');
  const [packageMain, setPackageMain] = useState('');
  const [owner, setOwner] = useState('');

  useEffect(() => {
    setWaiting(true);
    axios.get('/packages').then((response) => {
      const { data: packageList } = response;
      const packageMainList = [
        { key: '', value: '', text: '(None)' },
        ...packageList.filter((pkg: DocPackage) => !pkg.main)
          .map((pkg: DocPackage) => {
            const { _id, name } = pkg;
            return { key: _id, value: _id, text: name };
          }),
      ];
      setPackageMainList(packageMainList);
    }).catch((reason) => {
      console.error(reason);
    }).finally(() => {
      setWaiting(false);
    });
  }, []);

  return (
    <Modal {...modalProps}>
      <Modal.Header></Modal.Header>
      <Modal.Content>
        <Dimmer.Dimmable>
          <Form>
            <Form.Field>
              <label>Name</label>
              <input value={name} onChange={(e) => setName(e.target.value)} />
            </Form.Field>
            <Divider horizontal>Sub package information</Divider>
            <Form.Field>
              <label>Main package</label>
              <Select
                search options={packageMainList}
                value={packageMain} onChange={(e, d) => setPackageMain(d.value as string)}
              />
            </Form.Field>
            <Form.Field disabled={!packageMain}>
              <label>Owner</label>
              <Select select options={userList} />
            </Form.Field>
            <Divider horizontal>Additional information</Divider>
            <Form.Field disabled={!packageMain}>
              <label>Previous package</label>
              <Select search options={packageSubList} />
            </Form.Field>
            <Form.Field disabled={!packageMain}>
              <label>Deployment options</label>
            </Form.Field>
            <Form.Field disabled={!packageMain}>
              <label>Prodcuts</label>
            </Form.Field>
            <Form.Field disabled={!packageMain}>
              <label>Radio access technologies</label>
            </Form.Field>
            <Form.Field disabled={!packageMain}>
              <label>RAN sharing</label>
            </Form.Field>
          </Form>
          <Dimmer active={waiting}>
            <Loader />
          </Dimmer>
        </Dimmer.Dimmable>
      </Modal.Content>
      <Modal.Actions>
        <Button onClick={(e, d) => onClose && onClose(e, {})}>Cancel</Button>
        <Button
          color='green'
          disabled={!name || (!!packageMain && !owner)}
        >Add</Button>
      </Modal.Actions>
    </Modal>
  )
}
