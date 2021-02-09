import axios from "axios";
import { Component } from "react";
import { Container, Form, Header, Message } from "semantic-ui-react";
import { config } from 'randevu-shared/dist/config';

type Props = {
  onUpdateAuthenticationResult: (authenticated: boolean, role: string | undefined) => void;
};

type State = {
  username: string,
  password: string,
  loading: boolean,
  messageVisible: boolean,
}

class Login extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      username: '',
      password: '',
      loading: false,
      messageVisible: false,
    };
    const { api } = config;
    axios.defaults.baseURL = `http://${api.host}:${api.port}`;
    axios.defaults.withCredentials = true;
    this.login = this.login.bind(this);
  }

  onChangePassword(e: React.ChangeEvent<HTMLInputElement>) {
    const { value: password } = e.target;
    this.setState({ password });
  }

  onChangeUsername(e: React.ChangeEvent<HTMLInputElement>) {
    const { value: username } = e.target;
    this.setState({ username });
  }

  login() {
    const { onUpdateAuthenticationResult } = this.props;
    const { username, password, loading } = this.state;
    if (loading) {
      return;
    }
    this.setState({ loading: true });
    axios.post('/login', { username, password }).then((value) => {
      const { role } = value.data;
      this.setState({ loading: false });
      onUpdateAuthenticationResult(true, role);
    }).catch((reason) => {
      console.error(reason);
      this.setState({ loading: false, messageVisible: true });
    });
  }

  render() {
    const { username, password, loading, messageVisible } = this.state;
    const disabled = !username || !password;
    return (
      <Container>
        <Header as='h1'>Login</Header>
        <Form>
          <Form.Field error={!username}>
            <label>Username</label>
            <input type='text' value={username} onChange={(e) => this.onChangeUsername(e)} />
          </Form.Field>
          <Form.Field error={!password}>
            <label>Password</label>
            <input type='password' value={password} onChange={(e) => this.onChangePassword(e)} />
          </Form.Field>
          <Form.Button disabled={disabled} onClick={this.login} loading={loading}>Login</Form.Button>
        </Form>
        {
          messageVisible ? (
            <Message negative>
              <Message.Header>Login failed</Message.Header>
              Maybe due to incorrect user information or internal server error
            </Message>
          ) : <></>
        }
      </Container>
    );
  }
}

export default Login;
