import axios from "axios";
import { DocOperator, DocPackage, DocUser } from "randevu-shared/dist/types";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Dimmer, Header, Loader } from "semantic-ui-react";
import PackageTable from "./PackageTable";

type Props = {
  user: DocUser | undefined;
};

export default function PackageInfoMain({ user }: Props) {
  const { seqVal } = useParams() as any;

  const [name, setName] = useState('');
  const [waitingName, setWaitingName] = useState(false);
  const [packageList, setPackageList] = useState<DocPackage[]>([]);
  const [operatorList, setOperatorList] = useState<DocOperator[]>([]);
  const [waitingPackageList, setWaitingPackageList] = useState(false);

  useEffect(() => {
    setWaitingName(true);
    axios.get(`/packages/main/${seqVal}`).then((response) => {
      const { name } = response.data;
      setName(name);
    }).catch((reason) => {
      console.error(reason);
    }).finally(() => {
      setWaitingName(false);
    });
    setWaitingPackageList(true);
    axios.get('/operators').then((response) => {
      const { data: operatorList } = response;
      setOperatorList(operatorList);
      return axios.get(`/packages/main/${seqVal}/sub`);
    }).then((response) => {
      const { data: packageList } = response;
      setPackageList(packageList);
    }).catch((reason) => {
      console.error(reason);
    }).finally(() => {
      setWaitingPackageList(false);
    });
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
      <Header as='h2'>Sub packages</Header>
      <Dimmer.Dimmable>
        <PackageTable packageList={packageList} operatorList={operatorList} />
        <Dimmer active={waitingPackageList}>
          <Loader />
        </Dimmer>
      </Dimmer.Dimmable>
    </>
  );
}
