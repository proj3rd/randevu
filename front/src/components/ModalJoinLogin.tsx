import { useState } from "react";
import { Button, Form, Modal } from "semantic-ui-react";

type Props = {
  open?: boolean;
};

export default function ModalJoinLogin({ open }: Props) {
  const [modeJoin, setModeJoin] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [retype, setRetype] = useState('');

  return (
    <Modal open={open} dimmer='blurring'>
      <Modal.Header>Welcome to RANdevU</Modal.Header>
      <Modal.Content>
        <Form>
          <Form.Field error={!username}>
            <label>Username</label>
            <input value={username} onChange={(e) => setUsername(e.target.value)} />
          </Form.Field>
          <Form.Field error={!password}>
            <label>Password</label>
            <input type='password' value={password} onChange={(e) => setPassword(e.target.value)} />
          </Form.Field>
          {
            modeJoin ? (
              <Form.Field error={!retype || password !== retype}>
                <label>Retype password</label>
                <input type='password' value={retype} onChange={(e) => setRetype(e.target.value)} />
              </Form.Field>
            ) : (<></>)
          }
        </Form>
      </Modal.Content>
      <Modal.Actions>
        {
          modeJoin ? (
            <>
            <Button content='Login' icon='angle left' labelPosition='left' onClick={() => setModeJoin(false)} />
            <Button color='blue' disabled={!username || !password || password !== retype}>Join</Button>
            </>
          ) : (
            <>
              <Button content='Join' icon='angle left' labelPosition='left' onClick={() => setModeJoin(true)} />
              <Button color='green' disabled={!username || !password}>Login</Button>
            </>
          )
        }
      </Modal.Actions>
    </Modal>
  );
}
