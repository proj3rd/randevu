import axios from "axios";
import { DocOperator, DocPackage, DocUser } from "randevu-shared/dist/types";
import { useEffect, useState } from "react";
import { Dimmer, Header, Loader } from "semantic-ui-react";
import PackageTable from "../../components/PackageTable";

type Props = {
  user: DocUser | undefined;
};

export default function PackageSearch({ user }: Props) {
  const [waiting, setWaiting] = useState(false);
  const [packageList, setPackageList] = useState<DocPackage[]>([]);
  const [operatorList, setOperatorList] = useState<DocOperator[]>([]);

  useEffect(() => {
    setWaiting(true);
    axios.get('/operators').then((response) => {
      const { data: operatorList } = response;
      setOperatorList(operatorList);
      return axios.get('/packages?include[]=operator');
    }).then((response) => {
      const packageList = groupPackageList(response.data);
      setPackageList(packageList);
    }).catch((reason) => {
      console.error(reason);
    }).finally(() => {
      setWaiting(false);
    });
  }, [])

  function groupPackageList(packageList: DocPackage[]) {
    const packageMainList = packageList.filter((pkg) => !pkg.main);
    const packageSubList = packageList.filter((pkg) => pkg.main);
    const packageListGrouped: DocPackage[] = [];
    packageMainList.forEach((pkgMain) => {
      const { _id } = pkgMain;
      packageListGrouped.push(pkgMain);
      packageListGrouped.push(...packageSubList.filter((pkgSub) => pkgSub.main === _id));
    });
    return packageListGrouped;
  }

  function onAdd() {
    setWaiting(true);
    axios.get('/packages?include[]=operator').then((response) => {
      const packageList = groupPackageList(response.data);
      setPackageList(packageList);
    }).catch((reason) => {
      console.error(reason);
    }).finally(() => {
      setWaiting(false);
    });
  }

  return (
    <Dimmer.Dimmable>
      <Header as='h1'>Packages</Header>
      <PackageTable packageList={packageList} operatorList={operatorList} user={user} onAdd={onAdd} />
      <Dimmer active={waiting}>
        <Loader />
      </Dimmer>
    </Dimmer.Dimmable>
  )
}
