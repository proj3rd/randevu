import axios from "axios";
import { DocRegion, DocUser } from "randevu-shared/dist/types";
import { DataNode } from "rc-tree/lib/interface";

export async function getUserListForSelect(username: string) {
  return axios.get(`/users?username=${username}`).then((response) => {
    const userList = response.data as DocUser[];
    return userList.map((user) => {
      const { _id, username } = user;
      return { key: _id, value: _id, label: username };
    });
  }).catch((reason) => {
    console.error(reason);
    return [];
  });
}

export function regionListToDataNodeList(regionList: DocRegion[]): DataNode[] {
  const dataNodeList: (DataNode & { belongsTo: string | undefined })[] = regionList.map((region) => {
    const { _id, name, belongsTo } = region;
    return { key: _id, title: name, children: [], belongsTo };
  });
  // Put a region into an upper region
  dataNodeList.forEach((dataNode) => {
    const { belongsTo } = dataNode;
    const regionUpper = dataNodeList.find((region) => region.key === belongsTo);
    if (regionUpper) {
      regionUpper.children?.push(dataNode);
    }
  });
  // Find the top level region
  const topLevelRegion = dataNodeList.find((dataNode) => !dataNode.belongsTo);
  return topLevelRegion ? [topLevelRegion] : [];
}
