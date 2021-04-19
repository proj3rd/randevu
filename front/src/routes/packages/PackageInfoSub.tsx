import axios from "axios";
import { DocOperator, DocUser } from "randevu-shared/dist/types";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Dimmer, Header, Label, Loader } from "semantic-ui-react";
import { EnumItem } from "../../types";
import { markSelected } from "../../utils";
import EnumEditor from "../../components/EnumEditor";

type Props = {
  user: DocUser | undefined;
};

export default function PackageInfoSub({ user }: Props) {
  const { seqVal } = useParams() as any;

  const [name, setName] = useState('');
  const [waitingName, setWaitingName] = useState(false);
  const [operator, setOperator] = useState<DocOperator | undefined>(undefined);
  const [waitingOperator, setWaitingOperator] = useState(false);
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

    setWaitingOperator(true);
    axios.get(`/packages/sub/${seqVal}/operator`).then((response) => {
      const { data: operator } = response;
      setOperator(operator);
    }).catch((reason) => {
      console.error(reason);
    }).finally(() => {
      setWaitingOperator(false);
    });

    setWaitingDeploymentOptionList(true);
    let deploymentOptionListTemp: EnumItem[] = [];
    axios.get('/deployment-options').then((response) => {
      ({ data: deploymentOptionListTemp } = response);
      return axios.get(`/packages/sub/${seqVal}/deployment-options`);
    }).then((response) => {
      const { data: deploymentOptionListSelected } = response;
      const deploymentOptionListNew = markSelected(deploymentOptionListTemp, deploymentOptionListSelected);
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
      setRanSharingList(ranSharingListNew);
    }).catch((reason) => {
      console.error(reason);
    }).finally(() => {
      setWaitingRanSharingList(false);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seqVal]);

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
      <Dimmer.Dimmable>
        <Label>{operator ? operator.name : ''}</Label>
        <Dimmer active={waitingOperator}>
          <Loader />
        </Dimmer>
      </Dimmer.Dimmable>
      <Header as='h2'>Deployment options</Header>
      <Dimmer.Dimmable>
        <EnumEditor enumList={deploymentOptionList} editing={editingDeploymentOptionList} />
        <Dimmer active={waitingDeploymentOptionList}>
          <Loader />
        </Dimmer>
      </Dimmer.Dimmable>
      <Header as='h2'>Products</Header>
      <Dimmer.Dimmable>
        <EnumEditor enumList={productList} editing={editingProductList} />
        <Dimmer active={waitingProductList}>
          <Loader />
        </Dimmer>
      </Dimmer.Dimmable>
      <Header as='h2'>Radio access technologies</Header>
      <Dimmer.Dimmable>
        <EnumEditor enumList={ratList} editing={editingRatList} />
        <Dimmer active={waitingRatList}>
          <Loader />
        </Dimmer>
      </Dimmer.Dimmable>
      <Header as='h2'>RAN sharing</Header>
      <Dimmer.Dimmable>
        <EnumEditor enumList={ranSharingList} editing={editingRanSharingList} />
        <Dimmer active={waitingRanSharingList}>
          <Loader />
        </Dimmer>
      </Dimmer.Dimmable>
    </>
  );
}
