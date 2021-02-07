import { Component } from "react";
import { Container, Form } from "semantic-ui-react";

type Props = {};
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
  }

  onChangePassword(e: React.ChangeEvent<HTMLInputElement>) {
    const { value: password } = e.target;
    this.setState({ password });
  }

  onChangeUsername(e: React.ChangeEvent<HTMLInputElement>) {
    const { value: username } = e.target;
    this.setState({ username });
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
          <Form.Button disabled={disabled}>Login</Form.Button>
        </Form>
      </Container>
    );
  }
}

export default Login;
