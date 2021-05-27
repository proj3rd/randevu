import axios from "axios";
import { DocUser } from "randevu-shared/dist/types";

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
