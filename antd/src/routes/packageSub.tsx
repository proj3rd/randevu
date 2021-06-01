import { Breadcrumb, Descriptions, Skeleton, Tag } from "antd";
import Title from "antd/lib/typography/Title";
import axios from "axios";
import { DocEnum, DocOperator, DocPackage, DocUser } from "randevu-shared/dist/types";
import { useEffect, useState } from "react";
import { useParams } from "react-router";

export default function PackageSub() {
  const { seqVal } = useParams<any>();

  const [name, setName] = useState('');
  const [main, setMain] = useState<DocPackage | undefined>(undefined);
  const [operator, setOperator] = useState<DocOperator | undefined>(undefined);
  const [product, setProduct] = useState<DocEnum | undefined>(undefined);
  const [owner, setOwner] = useState<DocUser | undefined>(undefined);
  const [previous, setPrevious] = useState<DocPackage | null | undefined>(undefined);
  const [deploymentOptionList, setDeploymentOptionList] = useState<DocEnum[] | undefined>(undefined);
  const [ratList, setRatList] = useState<DocEnum[] | undefined>(undefined);
  const [ranSharingList, setRanSharingList] = useState<DocEnum[] | undefined>(undefined);

  useEffect(() => {
    axios.get(`/packages/sub/${seqVal}`).then((response) => {
      const { name } = response.data as DocPackage;
      setName(name);
    }).catch((reason) => {
      console.error(reason);
    });
    axios.get(`/packages/sub/${seqVal}/main`).then((response) => {
      const { data: main } = response;
      setMain(main);
    }).catch((reason) => {
      console.error(reason);
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
    axios.get(`/packages/sub/${seqVal}/previous`).then((response) => {
      const { data: previous } = response;
      setPrevious(previous || null);
    }).catch((reason) => {
      console.error(reason);
    });
    axios.get(`/packages/sub/${seqVal}/deployment-options`).then((response) => {
      const { data: deploymentOptionList } = response;
      setDeploymentOptionList(deploymentOptionList);
    }).catch((reason) => {
      console.error(reason);
    });
    axios.get(`/packages/sub/${seqVal}/radio-access-technologies`).then((response) => {
      const { data: ratList } = response;
      setRatList(ratList);
    }).catch((reason) => {
      console.error(reason);
    });
    axios.get(`/packages/sub/${seqVal}/ran-sharing`).then((response) => {
      const { data: ranSharingList } = response;
      setRanSharingList(ranSharingList);
    }).catch((reason) => {
      console.error(reason);
    });
  }, [seqVal]);

  return (
    <>
      <Breadcrumb>
        <Breadcrumb.Item>Packages</Breadcrumb.Item>
      </Breadcrumb>
      <Title level={3}>
        {
          name || <Skeleton.Input style={{ width: 200 }} active />
        }
      </Title>
      <Descriptions bordered>
        <Descriptions.Item label='Main package'>
          {
            main?.name ?? <Skeleton.Button active />
          }
        </Descriptions.Item>
        <Descriptions.Item label='Operator'>
          {
            operator?.name ?? <Skeleton.Button active />
          }
        </Descriptions.Item>
        <Descriptions.Item label='Product'>
          {
            product?.name ?? <Skeleton.Button active />
          }
        </Descriptions.Item>
        <Descriptions.Item label='Owner'>
          {
            owner?.username ?? <Skeleton.Button active />
          }
        </Descriptions.Item>
        <Descriptions.Item label='Previous package'>
          {
            previous ? previous.name : previous !== undefined ? 'None' : <Skeleton.Button active />
          }
        </Descriptions.Item>
        <Descriptions.Item label='Deployment options'>
          {
            deploymentOptionList ? deploymentOptionList.length ? (
              deploymentOptionList.map((deploymentOption) => {
                const { name } = deploymentOption;
                return (
                  <Tag>{name}</Tag>
                )
              })
            ) : 'None' : <Skeleton.Button active />
          }
        </Descriptions.Item>
        <Descriptions.Item label='Radio access technologies'>
          {
            ratList ? ratList.length ? (
              ratList.map((rat) => {
                const { name } = rat;
                return (
                  <Tag>{name}</Tag>
                )
              })
            ) : 'None' : <Skeleton.Button active />
          }
        </Descriptions.Item>
        <Descriptions.Item label='RAN sahring'>
          {
            ranSharingList ? ranSharingList.length ? (
              ranSharingList.map((ranSharing) => {
                const { name } = ranSharing;
                return (
                  <Tag>{name}</Tag>
                )
              })
            ) : 'None' : <Skeleton.Button active />
          }
        </Descriptions.Item>
      </Descriptions>
    </>
  )
}
