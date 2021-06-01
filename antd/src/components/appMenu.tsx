import { Menu } from "antd";
import { DocUser } from "randevu-shared/dist/types";
import { isAdmin } from "randevu-shared/dist/utils";
import { Link } from "react-router-dom";

type Props = {
  user: DocUser | undefined;
  onClickLogout: () => void;
};

export default function AppMenu({ user, onClickLogout }: Props) {
  return (
    <Menu mode='horizontal'>
      <Menu.Item>
        <Link to='/'>RANdevU</Link>
      </Menu.Item>
      <Menu.Item></Menu.Item>
      {/* <Menu.Item>Features</Menu.Item> */}
      <Menu.Item>
        <Link to='/operators'>Operators</Link>
      </Menu.Item>
      <Menu.Item>
        <Link to='/packages'>Packages</Link>
      </Menu.Item>
      {/* <Menu.Item>Requirements</Menu.Item> */}
      <Menu.SubMenu title='Collections'>
        <Menu.Item>
          <Link to='/deployment-options'>Deployment options</Link>
          </Menu.Item>
        <Menu.Item>
          <Link to='/duplex-modes'>Duplex modes</Link>
        </Menu.Item>
        <Menu.Item>
          <Link to='/network-elements'>Network elements</Link>
        </Menu.Item>
        <Menu.Item>
          <Link to='/products'>Products</Link>
        </Menu.Item>
        <Menu.Item>
          <Link to='/radio-access-technologies'>Radio access technologies</Link>
        </Menu.Item>
        <Menu.Item>
          <Link to='/ran-sharing'>RAN sharing</Link>
        </Menu.Item>
      </Menu.SubMenu>
      <Menu.Item></Menu.Item>
      {
        isAdmin(user) ? (
          <Menu.Item>Admin</Menu.Item>
        ) : (<></>)
      }
      {
        user ? (
          <Menu.Item onClick={onClickLogout}>Logout</Menu.Item>
        ) : (
          <>
            <Menu.Item>
              <Link to='/login'>Login</Link>
            </Menu.Item>
            <Menu.Item>
              <Link to='/join'>Join</Link>
            </Menu.Item>
          </>
        )
      }
    </Menu>
  )
}