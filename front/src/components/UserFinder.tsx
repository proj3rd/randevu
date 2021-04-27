import axios from "axios";
import { debounce } from "lodash";
import { DocUser } from "randevu-shared/dist/types";
import { useState } from "react";
import { Dimmer, Dropdown, DropdownOnSearchChangeData, Loader, Segment } from "semantic-ui-react";

type Props = {
  owner: DocUser | undefined;
  userList: DocUser[];
  onChange: (owner: DocUser) => void;
  onChangeUserList: (userList: DocUser[]) => void;
};

export default function UserFinder({ owner, userList, onChange, onChangeUserList }: Props) {
  const [waitingUserList, setWaitingUserList] = useState(false);

  const getUserList = debounce((username: string) => {
    axios.get(`/users?username=${username}`).then((response) => {
      const { data: userList } = response;
      onChangeUserList(userList);
      setWaitingUserList(false);
    });
  }, 500);

  function onSearchChange(
    event: React.SyntheticEvent<HTMLElement>,
    data: DropdownOnSearchChangeData,
  ) {
    const { searchQuery } = data;
    if (!searchQuery) {
      return;
    }
    setWaitingUserList(true);
    getUserList(searchQuery)
  }

  return (
    <Dropdown
      text={owner ? owner.username : 'Type and search owner'}
      search
      value={owner?._id}
      onSearchChange={onSearchChange}
    >
      <Dropdown.Menu>
        <Dropdown.Header>
          {
            waitingUserList ? (
              <Segment basic>
                <Dimmer active={true} inverted>
                  <Loader inverted />
                </Dimmer>
              </Segment>
            ) : (<></>)
          }
        </Dropdown.Header>
        {
          waitingUserList ? (<></>) : userList.length ? (
            userList.map((user) => {
              const { _id, username } = user;
              return (
                <Dropdown.Item
                  key={_id} value={_id} text={username}
                  onClick={(e, d) => onChange({ _id, username })}
                />
              )
            })
          ) : (
            <Dropdown.Item value='' text='No user matching query found' disabled />
          )
        }
      </Dropdown.Menu>
    </Dropdown>
  )
}
