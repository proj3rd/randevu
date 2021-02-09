import axios from "axios";
import { Component } from "react";
import { Container, Form, Header, Message } from "semantic-ui-react";

type Props = {};
type State = {
  username: string,
  password: string,
  retype: string,
  loading: boolean,
  messageVisible: boolean,
  negative: boolean,
  positive: boolean,
}

class Join extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      username: '',
      password: '',
      retype: '',
      loading: false,
      messageVisible: false,
      negative: false,
      positive: false,
    };
    this.onClickJoin = this.onClickJoin.bind(this);
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

  onClickJoin() {
    const { loading } = this.state;
    if (loading) {
      return;
    }
    this.setState({ loading: true });
    const { username, password } = this.state;
    axios.post('/join', { username, password }).then((value) => {
      this.setState({ loading: false, messageVisible: true, positive: true, negative: false });
    }).catch((reason) => {
      this.setState({ loading: false, messageVisible: true, positive: false, negative: true });
    });
  }

  render() {
    const { username, password, retype, loading, messageVisible, negative, positive } = this.state;
    const disabled = !username || !password || !retype || password !== retype;
    return (
      <Container>
        <Header as='h1'>Join RANdevU</Header>
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
          <Form.Button disabled={disabled} onClick={this.onClickJoin} loading={loading}>Join</Form.Button>
        </Form>
        {
          messageVisible && positive ? (
            <Message positive>
              <Message.Header>Thanks for joining!</Message.Header>
              You can use system after login
            </Message>
          ) : messageVisible && negative ? (
            <Message negative>
              <Message.Header>Join failed</Message.Header>
              Maybe due to internal server error
            </Message>
          ) : <></>
        }
      </Container>
    );
  }
}

export default Join;
