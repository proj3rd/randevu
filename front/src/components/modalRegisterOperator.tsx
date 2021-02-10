import axios from "axios";
import { config } from "randevu-shared/dist/config";
import { Component } from "react";
import { Button, Form, Message, Modal, ModalProps } from "semantic-ui-react";

type Props = {} & ModalProps;

type State = {
  operatorName: string,
  username: string,
  loading: boolean,
  messageVisible: boolean,
  positive: boolean,
  negative: boolean,
  messageContent: string,
};

class ModalRegisterOperator extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      operatorName: '',
      username: '',
      loading: false,
      messageVisible: false,
      positive: false,
      negative: false,
      messageContent: '',
    }
    this.registerOperator = this.registerOperator.bind(this);
    this.onChangeOperatorName = this.onChangeOperatorName.bind(this);
    this.onChangeOwner = this.onChangeOwner.bind(this);
    const { api } = config;
    axios.defaults.baseURL = `http://${api.host}:${api.port}`;
    axios.defaults.withCredentials = true;
  }

  registerOperator() {
    const { loading, operatorName, username } = this.state;
    if (loading) {
      return;
    }
    this.setState({ loading: true });
    axios.post('/operators/', { operatorName, username }).then((value) => {
      this.setState({ loading: false, messageVisible: true, positive: true, negative: false });
    }).catch((reason) => {
      const messageContent = reason?.response?.data?.reason ?? 'Maybe due to internal server error';
      this.setState({ loading: false, messageVisible: true, positive: false, negative: true, messageContent });
    })
  }

  onChangeOperatorName(e: React.ChangeEvent<HTMLInputElement>) {
    const operatorName = e.target.value;
    this.setState({ operatorName });
  }

  onChangeOwner(e: React.ChangeEvent<HTMLInputElement>) {
    const username = e.target.value;
    this.setState({ username });
  }

  render() {
    const { closeAction, ...modalProps } = this.props;
    const { operatorName, username, loading, messageVisible, positive, negative, messageContent } = this.state;
    const disabled = !operatorName || !username;
    return (
      <Modal {...modalProps} onClose={closeAction}>
        <Modal.Header>Register an operator</Modal.Header>
        <Modal.Content>
          <Form onSubmit={this.registerOperator}>
            <Form.Field error={!operatorName}>
              <label>Operator name</label>
              <input type='text' value={operatorName} onChange={this.onChangeOperatorName} />
            </Form.Field>
            <Form.Field error={!username}>
              <label>Owner</label>
              <input type='text' value={username} onChange={this.onChangeOwner} />
            </Form.Field>
          </Form>
          {
            messageVisible && positive ? (
              <Message positive>
                <Message.Header>Success</Message.Header>
                <Message.Content>Operator has been registered</Message.Content>
              </Message>
            ) : messageVisible && negative ? (
              <Message negative>
                <Message.Header>Oops</Message.Header>
                <Message.Content>{messageContent}</Message.Content>
              </Message>
            ) : <></>
          }
        </Modal.Content>
        <Modal.Actions>
          <Button onClick={closeAction}>Cancel</Button>
          <Button color='green' disabled={disabled} onClick={this.registerOperator} loading={loading}>Register</Button>
        </Modal.Actions>
      </Modal>
    );
  }
}

export default ModalRegisterOperator;
