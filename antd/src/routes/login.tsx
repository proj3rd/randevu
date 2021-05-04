import { Button, Form, Input, message } from "antd";
import axios from "axios";
import { DocUser } from "randevu-shared/dist/types";
import { useState } from "react";

type Props = {
  setWaiting?: (waiting: boolean) => void;
  onLogin?: (user: DocUser, redirect?: string) => void;
};

const layout = {
  labelCol: { span: 4 },
  wrapperCol: { span: 8 },
};

const tailLayout = {
  wrapperCol: { span: 8, offset: 4 },
};

export default function Login({ setWaiting, onLogin }: Props) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  function disabled() {
    return !username || !password;
  }

  function onSubmitCapture() {
    if (disabled()) {
      return;
    }
    setWaiting?.(true);
    axios.post('/login', { username, password }).then((response) => {
      const { data: user } = response;
      onLogin?.(user/* TODO: redirect */);
    }).catch((reason) => {
      console.error(reason);
      const content = reason.response?.data?.reason ?? 'Something went wrong. Please try again later';
      message.error(content);
    }).then(() => {
      setWaiting?.(false);
    })
  }

  return (
    <Form
      {...layout}
      onSubmitCapture={onSubmitCapture}
    >
      <Form.Item
        label='Username'
        name='username'
        rules={[{ required: true }]}
      >
        <Input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
      </Form.Item>
      <Form.Item
        label='Password'
        name='password'
        rules={[{ required: true }]}
      >
        <Input.Password
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </Form.Item>
      <Form.Item
        {...tailLayout}
      >
        <Button htmlType='submit' disabled={disabled()}>Login</Button>
      </Form.Item>
    </Form>
  )
}
