import axios from "axios";
import { DocOperator, DocPackage, DocUser } from "randevu-shared/dist/types";
import { useEffect, useState } from "react";
import { Button, Dimmer, Divider, DropdownItemProps, DropdownProps, Form, Loader, Modal, ModalProps, Select } from "semantic-ui-react";
import { EnumItem } from "../types";
import EnumSelector from "./EnumSelector";

type Props = {} & ModalProps;

export default function ModalPackageAddMod({ ...modalProps }: Props) {
  const { onClose } = modalProps;

  const [waiting, setWaiting] = useState(false);
  const [packageMainList, setPackageMainList] = useState<DropdownItemProps[]>([]);
  const [operatorList, setOperatorList] = useState<DropdownItemProps[]>([]);
  const [userList, setUserList] = useState<DropdownItemProps[]>([]);
  const [packageSubList, setPackageSubList] = useState<DropdownItemProps[]>([]);
  const [deploymentOptionList, setDeploymentOptionList] = useState<EnumItem[]>([]);
  const [productList, setProductList] = useState<EnumItem[]>([]);
  const [ratList, setRatList] = useState<EnumItem[]>([]);
  const [ranSharingList, setRanSharingList] = useState<EnumItem[]>([]);

  const [name, setName] = useState('');
  const [packageMain, setPackageMain] = useState('');
  const [operator, setOperator] = useState('');
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

  function disabled() {
    if (!name) {
      return true
    };
    if (!packageMain) {
      return false
    };
    if (!operator) {
      return true
    };
    if (!owner) {
      return true
    };
  }

  function onChangePackageMain(event: React.SyntheticEvent<HTMLElement>, data: DropdownProps) {
    const packageMain = data.value as string;
    setPackageMain(packageMain);
    if (!packageMain) {
      return;
    }
    setWaiting(true);
    axios.get('/users').then((response) => {
      const { data: userList } = response;
      setUserList(userList);
      return axios.get('/operators');
    }).then((response) => {
      const operatorList = response.data.map((item: DocOperator) => {
        const { _id, name } = item;
        return { key: _id, value: _id, text: name };
      });
      setOperatorList(operatorList);
      return axios.get('/users');
    }).then((response) => {
      const userList = response.data.map((item: DocUser) => {
        const { _id, username } = item;
        return { key: _id, value: _id, text: username };
      });
      setUserList(userList);
      return axios.get('/deployment-options');
    }).then((response) => {
      const { data: deploymentOptionList } = response;
      setDeploymentOptionList(deploymentOptionList);
      return axios.get('/products');
    }).then((response) => {
      const { data: productList } = response;
      setProductList(productList);
      return axios.get('/radio-access-technologies');
    }).then((response) => {
      const { data: ratList } = response;
      setRatList(ratList);
      return axios.get('/ran-sharing');
    }).then((response) => {
      const { data: ranSharingList } = response;
      setRanSharingList(ranSharingList);
    }).catch((reason) => {
      console.error(reason);
    }).finally(() => {
      setWaiting(false);
    });
  }

  function onChangeOperator(event: React.SyntheticEvent<HTMLElement>, data: DropdownProps) {
    setOperator(data.value as string);
    // TODO
  }

  return (
    <Modal {...modalProps}>
      <Modal.Header>Add a package</Modal.Header>
      <Modal.Content>
        <Dimmer.Dimmable>
          <Form>
            <Form.Field error={!name}>
              <label>Name</label>
              <input value={name} onChange={(e) => setName(e.target.value)} />
            </Form.Field>
            <Divider horizontal>Sub package information</Divider>
            <Form.Field>
              <label>Main package</label>
              <Select
                search options={packageMainList}
                value={packageMain} onChange={onChangePackageMain}
              />
            </Form.Field>
            <Form.Field error={packageMain && !operator} disabled={!packageMain}>
              <label>Operator</label>
              <Select
                search options={operatorList}
                value={operator} onChange={onChangeOperator}
              />
            </Form.Field>
            <Form.Field error={packageMain && !owner} disabled={!packageMain}>
              <label>Owner</label>
              <Select
                search options={userList}
                value={owner} onChange={(e, d) => setOwner(d.value as string)}
              />
            </Form.Field>
            <Divider horizontal>Additional information</Divider>
            <Form.Field disabled={!packageMain}>
              <label>Previous package</label>
              <Select search options={packageSubList} />
            </Form.Field>
            <Form.Field disabled={!packageMain}>
              <label>Deployment options</label>
              <EnumSelector
                enumList={deploymentOptionList}
                onChange={(deploymentOptionList) => setDeploymentOptionList([...deploymentOptionList])}
              />
            </Form.Field>
            <Form.Field disabled={!packageMain}>
              <label>Prodcuts</label>
              <EnumSelector
                enumList={productList}
                onChange={(productList) => setProductList([...productList])}
              />
            </Form.Field>
            <Form.Field disabled={!packageMain}>
              <label>Radio access technologies</label>
              <EnumSelector
                enumList={ratList}
                onChange={(ratList) => setRatList([...ratList])}
              />
            </Form.Field>
            <Form.Field disabled={!packageMain}>
              <label>RAN sharing</label>
              <EnumSelector
                enumList={ranSharingList}
                onChange={(ranSharingList) => setRanSharingList([...ranSharingList])}
              />
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
          disabled={disabled()}
        >Add</Button>
      </Modal.Actions>
    </Modal>
  )
}
