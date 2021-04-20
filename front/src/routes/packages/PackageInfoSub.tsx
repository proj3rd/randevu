import axios from "axios";
import { cloneDeep } from 'lodash';
import { DocOperator, DocUser } from "randevu-shared/dist/types";
import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { Dimmer, Header, Icon, Label, Loader } from "semantic-ui-react";
import { EnumItem } from "../../types";
import { markSelected } from "../../utils";
import EnumEditor from "../../components/EnumEditor";

type Props = {
  user: DocUser | undefined;
};

export default function PackageInfoSub({ user }: Props) {
  const { seqVal } = useParams() as any;

  let deploymentOptionListOriginal = useRef<EnumItem[]>([]);
  let productListOriginal = useRef<EnumItem[]>([]);
  let ratListOriginal = useRef<EnumItem[]>([]);
  let ranSharingListOriginal = useRef<EnumItem[]>([]);

  const [name, setName] = useState('');
  const [waitingName, setWaitingName] = useState(false);
  const [operator, setOperator] = useState<DocOperator | undefined>(undefined);
  const [owner, setOwner] = useState<DocUser | undefined>(undefined);
  const [deploymentOptionList, setDeploymentOptionList] = useState<EnumItem[]>([]);
  const [waitingDeploymentOptionList, setWaitingDeploymentOptionList] = useState(false);
  const [editingDeploymentOptionList, setEditingDeploymentOptionList] = useState(false);
  const [productList, setProductList] = useState<EnumItem[]>([]);
  const [waitingProductList, setWaitingProductList] = useState(false);
  const [editingProductList, setEditingProductList] = useState(false);
  const [ratList, setRatList] = useState<EnumItem[]>([]);
  const [waitingRatList, setWaitingRatList] = useState(false);
  const [editingRatList, setEditingRatList] = useState(false);
  const [ranSharingList, setRanSharingList] = useState<EnumItem[]>([]);
  const [waitingRanSharingList, setWaitingRanSharingList] = useState(false);
  const [editingRanSharingList, setEditingRanSharingList] = useState(false);

  useEffect(() => {
    setWaitingName(true);
    axios.get(`/packages/sub/${seqVal}`).then((response) => {
      const { name } = response.data;
      setName(name);
    }).catch((reason) => {
      console.error(reason);
    }).finally(() => {
      setWaitingName(false);
    });

    axios.get(`/packages/sub/${seqVal}/operator`).then((response) => {
      const { data: operator } = response;
      setOperator(operator);
    }).catch((reason) => {
      console.error(reason);
    });

    axios.get(`/packages/sub/${seqVal}/owner`).then((response) => {
      const { data: owner } = response;
      setOwner(owner);
    }).catch((reason) => {
      console.error(reason);
    });

    setWaitingDeploymentOptionList(true);
    let deploymentOptionListTemp: EnumItem[] = [];
    axios.get('/deployment-options').then((response) => {
      ({ data: deploymentOptionListTemp } = response);
      return axios.get(`/packages/sub/${seqVal}/deployment-options`);
    }).then((response) => {
      const { data: deploymentOptionListSelected } = response;
      const deploymentOptionListNew = markSelected(deploymentOptionListTemp, deploymentOptionListSelected);
      deploymentOptionListOriginal.current = cloneDeep(deploymentOptionListNew);
      setDeploymentOptionList(deploymentOptionListNew);
    }).catch((reason) => {
      console.error(reason);
    }).finally(() => {
      setWaitingDeploymentOptionList(false);
    });

    setWaitingProductList(true);
    let productListTemp: EnumItem[] = [];
    axios.get('/products').then((response) => {
      ({ data: productListTemp } = response);
      return axios.get(`/packages/sub/${seqVal}/products`);
    }).then((response) => {
      const { data: productListSelected } = response;
      const productListNew = markSelected(productListTemp, productListSelected);
      productListOriginal.current = cloneDeep(productListNew);
      setProductList(productListNew);
    }).catch((reason) => {
      console.error(reason);
    }).finally(() => {
      setWaitingProductList(false);
    });

    setWaitingRatList(true);
    let ratListTemp: EnumItem[] = [];
    axios.get('/radio-access-technologies').then((response) => {
      ({ data: ratListTemp } = response);
      return axios.get(`/packages/sub/${seqVal}/radio-access-technologies`);
    }).then((response) => {
      const { data: ratListSelected } = response;
      const ratListNew = markSelected(ratListTemp, ratListSelected);
      ratListOriginal.current = cloneDeep(ratListNew);
      setRatList(ratListNew);
    }).catch((reason) => {
      console.error(reason);
    }).finally(() => {
      setWaitingRatList(false);
    });

    setWaitingRanSharingList(true);
    let ranSharingListTemp: EnumItem[] = [];
    axios.get('/ran-sharing').then((response) => {
      ({ data: ranSharingListTemp } = response);
      return axios.get(`/packages/sub/${seqVal}/ran-sharing`);
    }).then((response) => {
      const { data: ranSharingListSelected } = response;
      const ranSharingListNew = markSelected(ranSharingListTemp, ranSharingListSelected);
      ranSharingListOriginal.current = cloneDeep(ranSharingListNew);
      setRanSharingList(ranSharingListNew);
    }).catch((reason) => {
      console.error(reason);
    }).finally(() => {
      setWaitingRanSharingList(false);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seqVal]);

  function cancelEditingDeploymentOptionList() {
    setDeploymentOptionList(cloneDeep(deploymentOptionListOriginal.current));
    setEditingDeploymentOptionList(false);
  }

  function cancelEditingProductList() {
    setProductList(cloneDeep(productListOriginal.current));
    setEditingProductList(false);
  }

  function cancelEditingRatList() {
    setRatList(cloneDeep(ratListOriginal.current));
    setEditingRatList(false);
  }

  function cancelEditingRanSharingList() {
    setRanSharingList(cloneDeep(ranSharingListOriginal.current));
    setEditingRanSharingList(false);
  }

  return (
    <>
      <Dimmer.Dimmable>
        <Header as='h1'>
          <Header.Subheader>Packages</Header.Subheader>
          {name}
        </Header>
        <Dimmer active={waitingName}>
          <Loader />
        </Dimmer>
      </Dimmer.Dimmable>
      <div>
        <Label>
          Operator
          <Label.Detail>{operator?.name ?? ''}</Label.Detail>
        </Label>
        <Label>
          Owner
          <Label.Detail>{owner?.username ?? ''}</Label.Detail>
        </Label>
      </div>
      <Header as='h2'>Deployment options</Header>
      <Dimmer.Dimmable>
        <EnumEditor enumList={deploymentOptionList} editing={editingDeploymentOptionList} />
        {
          editingDeploymentOptionList ? (
            <>
            <Label as='a' basic>
              <Icon name='check' />
              Save
            </Label>
            <Label as='a' basic onClick={cancelEditingDeploymentOptionList}>
              <Icon name='cancel' />
              Cancel
            </Label>
            </>
          ) : (
            <Label as='a' basic onClick={() => setEditingDeploymentOptionList(true)}>
              <Icon name='edit' />
              Edit
            </Label>
          )
        }
        <Dimmer active={waitingDeploymentOptionList}>
          <Loader />
        </Dimmer>
      </Dimmer.Dimmable>
      <Header as='h2'>Products</Header>
      <Dimmer.Dimmable>
        <EnumEditor enumList={productList} editing={editingProductList} />
        {
          editingProductList ? (
            <>
            <Label as='a' basic>
              <Icon name='check' />
              Save
            </Label>
            <Label as='a' basic onClick={cancelEditingProductList}>
              <Icon name='cancel' />
              Cancel
            </Label>
            </>
          ) : (
            <Label as='a' basic onClick={() => setEditingProductList(true)}>
              <Icon name='edit' />
              Edit
            </Label>
          )
        }
        <Dimmer active={waitingProductList}>
          <Loader />
        </Dimmer>
      </Dimmer.Dimmable>
      <Header as='h2'>Radio access technologies</Header>
      <Dimmer.Dimmable>
        <EnumEditor enumList={ratList} editing={editingRatList} />
        {
          editingRatList ? (
            <>
            <Label as='a' basic>
              <Icon name='check' />
              Save
            </Label>
            <Label as='a' basic onClick={cancelEditingRatList}>
              <Icon name='cancel' />
              Cancel
            </Label>
            </>
          ) : (
            <Label as='a' basic onClick={() => setEditingRatList(true)}>
              <Icon name='edit' />
              Edit
            </Label>
          )
        }
        <Dimmer active={waitingRatList}>
          <Loader />
        </Dimmer>
      </Dimmer.Dimmable>
      <Header as='h2'>RAN sharing</Header>
      <Dimmer.Dimmable>
        <EnumEditor enumList={ranSharingList} editing={editingRanSharingList} />
        {
          editingRanSharingList ? (
            <>
            <Label as='a' basic>
              <Icon name='check' />
              Save
            </Label>
            <Label as='a' basic onClick={cancelEditingRanSharingList}>
              <Icon name='cancel' />
              Cancel
            </Label>
            </>
          ) : (
            <Label as='a' basic onClick={() => setEditingRanSharingList(true)}>
              <Icon name='edit' />
              Edit
            </Label>
          )
        }
        <Dimmer active={waitingRanSharingList}>
          <Loader />
        </Dimmer>
      </Dimmer.Dimmable>
    </>
  );
}
