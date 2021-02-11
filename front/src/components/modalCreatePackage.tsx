import axios from "axios";
import { config } from "randevu-shared/dist/config";
import { Component } from "react";
import { Button, Form, Message, Modal, ModalProps } from "semantic-ui-react";

type Props = {} & ModalProps;

type State = {
  packageName: string,
  owner: string,
  loading: boolean,
  messageVisible: boolean,
  positive: boolean,
  negative: boolean,
  messageContent: string,
};

class ModalCreatePackage extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      packageName: '',
      owner: '',
      loading: false,
      messageVisible: false,
      positive: false,
      negative: false,
      messageContent: '',
    }
    this.createPackage = this.createPackage.bind(this);
    this.onChangePackageName = this.onChangePackageName.bind(this);
    this.onChangeOwner = this.onChangeOwner.bind(this);
    const { api } = config;
    axios.defaults.baseURL = `http://${api.host}:${api.port}`;
    axios.defaults.withCredentials = true;
  }

  createPackage() {
    const { loading, packageName, owner } = this.state;
    if (loading) {
      return;
    }
    this.setState({ loading: true });
    axios.post('/packages/', { packageName, owner }).then((value) => {
      this.setState({ loading: false, messageVisible: true, positive: true, negative: false });
    }).catch((reason) => {
      const messageContent = reason?.response?.data?.reason ?? 'Maybe due to internal server error';
      this.setState({ loading: false, messageVisible: true, positive: false, negative: true, messageContent });
    })
  }

  onChangePackageName(e: React.ChangeEvent<HTMLInputElement>) {
    const packageName = e.target.value;
    this.setState({ packageName });
  }

  onChangeOwner(e: React.ChangeEvent<HTMLInputElement>) {
    const owner = e.target.value;
    this.setState({ owner });
  }

  render() {
    const { closeAction, ...modalProps } = this.props;
    const { packageName, owner, loading, messageVisible, positive, negative, messageContent } = this.state;
    const disabled = !packageName || !owner;
    return (
      <Modal {...modalProps} onClose={closeAction}>
        <Modal.Header>Create a package</Modal.Header>
        <Modal.Content>
          <Form onSubmit={this.createPackage}>
            <Form.Field error={!packageName}>
              <label>Package name</label>
              <input type='text' value={packageName} onChange={this.onChangePackageName} />
            </Form.Field>
            <Form.Field error={!owner}>
              <label>Owner</label>
              <input type='text' value={owner} onChange={this.onChangeOwner} />
            </Form.Field>
          </Form>
          {
            messageVisible && positive ? (
              <Message positive>
                <Message.Header>Success</Message.Header>
                <Message.Content>Package has been created</Message.Content>
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
          <Button color='green' disabled={disabled} onClick={this.createPackage} loading={loading}>Create</Button>
        </Modal.Actions>
      </Modal>
    );
  }
}

export default ModalCreatePackage;
