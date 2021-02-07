import axios from "axios";
import { Component } from "react";
import { Container, Form } from "semantic-ui-react";
import { config } from 'randevu-shared/dist/config';

type Props = {
  updateAuthenticationResult: (authenticated: boolean) => void;
};
type State = {
  username: string,
  password: string,
}

class Login extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      username: '',
      password: '',
    };
    const { api } = config;
    axios.defaults.baseURL = `http://${api.host}:${api.port}`;
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
    });
  }

  render() {
    const { username, password } = this.state;
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
      </Container>
    );
  }
}

export default Login;
