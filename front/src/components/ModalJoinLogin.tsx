import axios from "axios";
import { config } from 'randevu-shared/dist/config';
import { DocUser } from "randevu-shared/dist/types";
import { useState } from "react";
import { Button, Form, Message, Modal } from "semantic-ui-react";

const { api } = config;
axios.defaults.baseURL = `http://${api.host}:${api.port}`;
axios.defaults.withCredentials = true;

type Props = {
  open?: boolean;
  onLogin?: (user: DocUser) => void;
};

export default function ModalJoinLogin({ open, onLogin }: Props) {
  const [modeJoin, setModeJoin] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [retype, setRetype] = useState('');
  const [waiting, setWaiting] = useState(false);
  const [messageVisible, setMessageVisible] = useState(false);
  const [messagePositive, setMessagePositive] = useState(true);
  const [messageContent, setMessageContent] = useState('');

  function disabled() {
    return !username || !password || (modeJoin && password !== retype);
  }

  function join() {
    if (disabled()) return;
    setWaiting(true);
    axios.post('/join', { username, password }).then((response) => {
      setMessageVisible(true);
      setMessagePositive(true);
      setMessageContent('Thanks for joining. You can use RANdevU after logging in.');
    }).catch((reason) => {
      console.error(reason);
      setMessageVisible(true);
      setMessagePositive(false);
      if (reason.response && reason.response.status === 500) {
        setMessageContent('Login failed due to internal server error. Please contact the administrator.')
      } else {
        setMessageContent('Something went wrong. Please try again.')
      }
    }).finally(() => {
      setWaiting(false);
    });
  }

  function login() {
    if (disabled()) return;
    setWaiting(true);
    axios.post('/login', { username, password }).then((response) => {
      const { data: user } = response;
      setMessageVisible(false);
      onLogin && onLogin(user);
    }).catch((reason) => {
      console.error(reason);
      setMessageVisible(true);
      setMessagePositive(false);
      if (reason.response && reason.response.status === 500) {
        setMessageContent('Login failed due to internal server error. Please contact the administrator.')
      } else {
        setMessageContent('Something went wrong. Please try again.')
      }
    }).finally(() => {
      setWaiting(false);
    });
  }

  return (
    <Modal open={open} dimmer='blurring'>
      <Modal.Header>Welcome to RANdevU</Modal.Header>
      <Modal.Content>
        <Form onSubmit={modeJoin ? join : login}>
          <Form.Field error={!username} disabled={waiting}>
            <label>Username</label>
            <input value={username} onChange={(e) => setUsername(e.target.value)} />
          </Form.Field>
          <Form.Field error={!password} disabled={waiting}>
            <label>Password</label>
            <input type='password' value={password} onChange={(e) => setPassword(e.target.value)} />
          </Form.Field>
          {
            modeJoin ? (
              <>
              <Form.Field error={!retype || password !== retype} disabled={waiting}>
                <label>Retype password</label>
                <input type='password' value={retype} onChange={(e) => setRetype(e.target.value)} />
              </Form.Field>
              <Button type='button' content='Login' icon='angle left' labelPosition='left' disabled={waiting} onClick={() => setModeJoin(false)} />
              <Button type='submit' color='blue' disabled={disabled() || waiting} onClick={join}>Join</Button>
              </>
            ) : (
              <>
                <Button type='button' content='Join' icon='angle left' labelPosition='left' disabled={waiting} onClick={() => setModeJoin(true)} />
                <Button type='submit' color='green' disabled={disabled() || waiting} onClick={login}>Login</Button>
              </>
            )
          }
        </Form>
        {
          messageVisible ? (
            <Message visible positive={messagePositive} negative={!messagePositive}>
              {messageContent}
            </Message>
          ) : (<></>)
        }
      </Modal.Content>
      <Modal.Actions>
      </Modal.Actions>
    </Modal>
  );
}
