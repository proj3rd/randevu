import axios from "axios";
import { config } from "randevu-shared/dist/config";
import { Component } from "react";
import { Button, Form, Message, Modal, ModalProps } from "semantic-ui-react";

type Props = {} & ModalProps;

type State = {
  featureId: string,
  featureName: string,
  username: string,
  loading: boolean,
  messageVisible: boolean,
  positive: boolean,
  negative: boolean,
  messageContent: string,
};

class ModalCreateFeature extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      featureId: '',
      featureName: '',
      username: '',
      loading: false,
      messageVisible: false,
      positive: false,
      negative: false,
      messageContent: '',
    }
    this.createFeature = this.createFeature.bind(this);
    this.onChangeFeatureId = this.onChangeFeatureId.bind(this);
    this.onChangeFeatureName = this.onChangeFeatureName.bind(this);
    this.onChangeOwner = this.onChangeOwner.bind(this);
    const { api } = config;
    axios.defaults.baseURL = `http://${api.host}:${api.port}`;
    axios.defaults.withCredentials = true;
  }

  createFeature() {
    const { loading, featureId, featureName, username } = this.state;
    if (loading) {
      return;
    }
    this.setState({ loading: true });
    axios.post('/features/', { featureId, featureName, username }).then((value) => {
      this.setState({ loading: false, messageVisible: true, positive: true, negative: false });
    }).catch((reason) => {
      const messageContent = reason?.response?.data?.reason ?? 'Maybe due to internal server error';
      this.setState({ loading: false, messageVisible: true, positive: false, negative: true, messageContent });
    })
  }

  onChangeFeatureId(e: React.ChangeEvent<HTMLInputElement>) {
    const featureId = e.target.value;
    this.setState({ featureId });
  }

  onChangeFeatureName(e: React.ChangeEvent<HTMLInputElement>) {
    const featureName = e.target.value;
    this.setState({ featureName });
  }

  onChangeOwner(e: React.ChangeEvent<HTMLInputElement>) {
    const username = e.target.value;
    this.setState({ username });
  }

  render() {
    const { closeAction, ...modalProps } = this.props;
    const { featureId, featureName, username, loading, messageVisible, positive, negative, messageContent } = this.state;
    const disabled = !featureId || !featureName || !username;
    return (
      <Modal {...modalProps} onClose={closeAction}>
        <Modal.Header>Create a feature</Modal.Header>
        <Modal.Content>
          <Form onSubmit={this.createFeature}>
            <Form.Field error={!featureId}>
              <label>Feature ID</label>
              <input type='text' value={featureId} onChange={this.onChangeFeatureId} />
            </Form.Field>
            <Form.Field error={!featureName}>
              <label>Feature name</label>
              <input type='text' value={featureName} onChange={this.onChangeFeatureName} />
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
                <Message.Content>Feature has been created</Message.Content>
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
          <Button color='green' disabled={disabled} onClick={this.createFeature} loading={loading}>Create</Button>
        </Modal.Actions>
      </Modal>
    );
  }
}

export default ModalCreateFeature;
