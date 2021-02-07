import { Component } from "react";
import { Container, Form } from "semantic-ui-react";

type Props = {};
type State = {
  username: string,
  password: string,
  retype: string,
}

class Join extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      username: '',
      password: '',
      retype: '',
    };
  }

  onChangePassword(e: React.ChangeEvent<HTMLInputElement>) {
    const { value: password } = e.target;
    this.setState({ password });
  }

  onChangeRetype(e: React.ChangeEvent<HTMLInputElement>) {
    const { value: retype } = e.target;
    this.setState({ retype });
  }

  onChangeUsername(e: React.ChangeEvent<HTMLInputElement>) {
    const { value: username } = e.target;
    this.setState({ username });
  }

  render() {
    const { username, password, retype } = this.state;
    const disabled = !username || !password || !retype || password !== retype;
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
          <Form.Field error={!retype || password !== retype}>
            <label>Retype password</label>
            <input type='password' value={retype} onChange={(e) => this.onChangeRetype(e)} />
          </Form.Field>
          <Form.Button disabled={disabled}>Join</Form.Button>
        </Form>
      </Container>
    );
  }
}

export default Join;
