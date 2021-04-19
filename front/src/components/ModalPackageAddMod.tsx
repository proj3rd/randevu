import axios from "axios";
import { DocOperator, DocPackage, DocUser } from "randevu-shared/dist/types";
import { useEffect, useState } from "react";
import { Button, Dimmer, Divider, DropdownItemProps, DropdownProps, Form, Loader, Message, Modal, ModalProps, Select } from "semantic-ui-react";
import { EnumItem } from "../types";
import EnumEditor from "./EnumEditor";

type Props = {
  onAdd?: () => void;
} & ModalProps;

export default function ModalPackageAddMod({ onAdd, ...modalProps }: Props) {
  const { onClose } = modalProps;

  const [waiting, setWaiting] = useState(false);
  const [packageList, setPackageList] = useState<DocPackage[]>([]);
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
  const [packagePrevious, setPackagePrevious] = useState('');

  const [messageVisible, setMessageVisible] = useState(false);
  const [messageContent, setMessageContent] = useState('');

  useEffect(() => {
    setWaiting(true);
    axios.get('/packages?include[]=operator').then((response) => {
      const { data: packageList } = response;
      setPackageList(packageList);
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

  function addPackage() {
    if (disabled()) {
      return;
    }
    setWaiting(true);
    const deploymentOptions = deploymentOptionList
      .filter((deploymentOption) => deploymentOption.selected)
      .map((deploymentOption) => deploymentOption._id);
    const products = productList
      .filter((product) => product.selected)
      .map((product) => product._id);
    const radioAccessTechnologies = ratList
      .filter((rat) => rat.selected)
      .map((rat) => rat._id);
    const ranSharing = ranSharingList
      .filter((ranSharing) => ranSharing.selected)
      .map((ranSharing) => ranSharing._id);
    const sub = packageMain && operator && owner ? {
      main: packageMain, operator, previous: packagePrevious, owner,
      deploymentOptions, products, radioAccessTechnologies, ranSharing,
    } : undefined;
    axios.post('/packages', { name, sub }).then((response) => {
      setMessageVisible(false);
      onAdd?.();
    }).catch((reason) => {
      console.error(reason);
      const messageContent = reason.response?.data?.reason
        ?? 'Oops. Something went wrong. Please try again later.';
      setMessageContent(messageContent);
      setMessageVisible(true);
    }).finally(() => {
      setWaiting(false);
    })
  }

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
    const operator = data.value as string;
    setOperator(operator);
    const packageSubList = [
      { key: '', value: '', text: '(None)' },
      ...packageList.filter((pkg) => pkg.operator === operator)
        .map((pkg) => {
          const { _id, name } = pkg;
          return { key: _id, value: _id, text: name };
        }),
    ];
    setPackageSubList(packageSubList);
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
              <Select
                search options={packageSubList}
                value={packagePrevious} onChange={(e, d) => setPackagePrevious(d.value as string)}
              />
            </Form.Field>
            <Form.Field disabled={!packageMain}>
              <label>Deployment options</label>
              <EnumEditor
                enumList={deploymentOptionList}
                onChange={(deploymentOptionList) => setDeploymentOptionList([...deploymentOptionList])}
              />
            </Form.Field>
            <Form.Field disabled={!packageMain}>
              <label>Prodcuts</label>
              <EnumEditor
                enumList={productList}
                onChange={(productList) => setProductList([...productList])}
              />
            </Form.Field>
            <Form.Field disabled={!packageMain}>
              <label>Radio access technologies</label>
              <EnumEditor
                enumList={ratList}
                onChange={(ratList) => setRatList([...ratList])}
              />
            </Form.Field>
            <Form.Field disabled={!packageMain}>
              <label>RAN sharing</label>
              <EnumEditor
                enumList={ranSharingList}
                onChange={(ranSharingList) => setRanSharingList([...ranSharingList])}
              />
            </Form.Field>
          </Form>
          <Dimmer active={waiting}>
            <Loader />
          </Dimmer>
        </Dimmer.Dimmable>
        {
          messageVisible ? (
            <Message visible negative>{messageContent}</Message>
          ) : (<></>)
        }
      </Modal.Content>
      <Modal.Actions>
        <Button onClick={(e, d) => onClose && onClose(e, {})}>Cancel</Button>
        <Button
          color='green'
          disabled={disabled()}
          onClick={addPackage}
        >Add</Button>
      </Modal.Actions>
    </Modal>
  )
}
