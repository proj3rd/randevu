import { Tree } from "antd";
import Title from "antd/lib/typography/Title";
import axios from "axios";
import { DocRegion, DocUser } from "randevu-shared/dist/types";
import { DataNode } from "rc-tree/lib/interface";
import { useEffect, useState } from "react";
import { useHistory, useRouteMatch } from "react-router";

type Props = {
  user?: DocUser | undefined;
  setUser?: (user: DocUser | undefined) => void;
  setWaiting?: (waiting: boolean) => void;
};

export default function Regions({ user, setUser, setWaiting: setWaitingApp }: Props) {
  const history = useHistory();
  const { url } = useRouteMatch();

  const [regionList, setRegionList] = useState<DataNode[]>([]);

  useEffect(() => {
    setWaitingApp?.(true);
    axios.get('/authenticate').then((response) => {
      const { data: user } = response;
      setUser?.(user);
      axios.get('/regions').then((response) => {
        const regionList: (DataNode & { belongsTo: string | undefined })[] = (
          response.data as DocRegion[]
        ).map((region) => {
          const { _id, name, belongsTo } = region;
          return { key: _id, title: name, children: [], belongsTo };
        });
        // Put a region into an upper region
        regionList.map((region) => {
          const { belongsTo } = region;
          const regionUpper = regionList.find((region) => region.key === belongsTo);
          if (regionUpper) {
            regionUpper.children?.push(region);
          }
        });
        // Find the top level region
        const topLevelRegion = regionList.find((region) => !region.belongsTo);
        if (topLevelRegion) {
          setRegionList([topLevelRegion]);
        } else {
          setRegionList([]);
        }
      });
    }).catch((reason) => {
      setUser?.(undefined);
      history.push(`/login?redirect=${url}`);
    }).finally(() => {
      setWaitingApp?.(false);
    })
  }, [history, url, setUser, setWaitingApp]);

  return (
    <>
      <Title level={3}>Regions</Title>
      <Tree treeData={regionList} />
    </>
  )
}
