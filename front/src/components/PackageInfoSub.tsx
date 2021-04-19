import axios from "axios";
import { DocOperator, DocUser } from "randevu-shared/dist/types";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Dimmer, Header, Label, Loader } from "semantic-ui-react";
import { EnumItem } from "../types";
import { markSelected } from "../utils";
import EnumList from "./EnumList";

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
  const [productList, setProductList] = useState<EnumItem[]>([]);
  const [waitingProductList, setWaitingProductList] = useState(false);
  const [ratList, setRatList] = useState<EnumItem[]>([]);
  const [waitingRatList, setWaitingRatList] = useState(false);
  const [ranSharingList, setRanSharingList] = useState<EnumItem[]>([]);
  const [waitingRanSharingList, setWaitingRanSharingList] = useState(false);

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
    axios.get('/deployment-options').then((response) => {
      const { data: deploymentOptionList } = response;
      setDeploymentOptionList(deploymentOptionList);
      return axios.get(`/packages/sub/${seqVal}/deployment-options`);
    }).then((response) => {
      const { data: deploymentOptionListSelected } = response;
      const deploymentOptionListNew = markSelected(deploymentOptionList, deploymentOptionListSelected);
      setDeploymentOptionList(deploymentOptionListNew);
    }).catch((reason) => {
      console.error(reason);
    }).finally(() => {
      setWaitingDeploymentOptionList(false);
    });
    axios.get(`/packages/sub/${seqVal}/deployment-options`).then((response) => {
      const { data: deploymentOptionList } = response;
      setDeploymentOptionList(deploymentOptionList);
    })

    setWaitingProductList(true);
    axios.get('/products').then((response) => {
      const { data: productList } = response;
      setProductList(productList);
      return axios.get(`/packages/sub/${seqVal}/products`);
    }).then((response) => {
      const { data: productListSelected } = response;
      const productListNew = markSelected(productList, productListSelected);
      setProductList(productListNew);
    }).catch((reason) => {
      console.error(reason);
    }).finally(() => {
      setWaitingProductList(false);
    });

    setWaitingRatList(true);
    axios.get('/radio-access-technologies').then((response) => {
      const { data: ratList } = response;
      setRatList(ratList);
      return axios.get(`/packages/sub/${seqVal}/radio-access-technologies`);
    }).then((response) => {
      const { data: ratListSelected } = response;
      const ratListNew = markSelected(ratList, ratListSelected);
      setRatList(ratListNew);
    }).catch((reason) => {
      console.error(reason);
    }).finally(() => {
      setWaitingRatList(false);
    });

    setWaitingRanSharingList(true);
    axios.get('/ran-sharing').then((response) => {
      const { data: ranSharingList } = response;
      setRanSharingList(ranSharingList);
      return axios.get(`/packages/sub/${seqVal}/ran-sharing`);
    }).then((response) => {
      const { data: ranSharingListSelected } = response;
      const ranSharingListNew = markSelected(ranSharingList, ranSharingListSelected);
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
        <EnumList enumList={deploymentOptionList} />
        <Dimmer active={waitingDeploymentOptionList}>
          <Loader />
        </Dimmer>
      </Dimmer.Dimmable>
      <Header as='h2'>Products</Header>
      <Dimmer.Dimmable>
        <EnumList enumList={productList} />
        <Dimmer active={waitingProductList}>
          <Loader />
        </Dimmer>
      </Dimmer.Dimmable>
      <Header as='h2'>Radio access technologies</Header>
      <Dimmer.Dimmable>
        <EnumList enumList={ratList} />
        <Dimmer active={waitingRatList}>
          <Loader />
        </Dimmer>
      </Dimmer.Dimmable>
      <Header as='h2'>RAN sharing</Header>
      <Dimmer.Dimmable>
        <EnumList enumList={ranSharingList} />
        <Dimmer active={waitingRanSharingList}>
          <Loader />
        </Dimmer>
      </Dimmer.Dimmable>
    </>
  );
}
