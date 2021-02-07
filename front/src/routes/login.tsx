import axios from "axios";
import { Component } from "react";
import { Container, Form, Message } from "semantic-ui-react";
import { config } from 'randevu-shared/dist/config';

type Props = {
  updateAuthenticationResult: (authenticated: boolean) => void;
};

type State = {
  username: string,
  password: string,
  messageVisible: boolean,
}

class Login extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      username: '',
      password: '',
      messageVisible: false,
    };
    const { api } = config;
    axios.defaults.baseURL = `http://${api.host}:${api.port}`;
    axios.defaults.withCredentials = true;
    this.onClickLogin = this.onClickLogin.bind(this);
  }

  onChangePassword(e: React.ChangeEvent<HTMLInputElement>) {
    const { value: password } = e.target;
    this.setState({ password });
  }

  onChangeUsername(e: React.ChangeEvent<HTMLInputElement>) {
    const { value: username } = e.target;
    this.setState({ username });
  }

  onClickLogin() {
    const { updateAuthenticationResult } = this.props;
    const { username, password } = this.state;
    axios.post('/login', { username, password }).then((value) => {
      updateAuthenticationResult(true);
    }).catch((reason) => {
      console.error(reason);
      this.setState({ messageVisible: true });
    });
  }

  render() {
    const { username, password, messageVisible } = this.state;
    const disabled = !username || !password;
    return (
      <Container>
        <Form>
          <Form.Field error={!username}>
            <label>Username</label>
            <input type='text' value={username} onChange={(e) => this.onChangeUsername(e)} />
          </Form.Field>
          <Form.Field error={!password}>
            <label>Password</label>
            <input type='password' value={password} onChange={(e) => this.onChangePassword(e)} />
          </Form.Field>
          <Form.Button disabled={disabled} onClick={this.onClickLogin}>Login</Form.Button>
        </Form>
        {
          messageVisible ? (
            <Message negative>
              <Message.Header>Login failed</Message.Header>
              Myabe due to incorrect user information or internal server error
            </Message>
          ) : <></>
        }
      </Container>
    );
  }
}

export default Login;
