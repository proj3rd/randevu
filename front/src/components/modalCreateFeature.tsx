import axios from "axios";
import { config } from "randevu-shared/dist/config";
import { Component } from "react";
import { Button, Form, Modal, ModalProps } from "semantic-ui-react";

type Props = {} & ModalProps;

type State = {
  featureId: string,
  featureName: string,
  username: string,
};

class ModalCreateFeature extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      featureId: '',
      featureName: '',
      username: '',
    }
    this.onChangeFeatureId = this.onChangeFeatureId.bind(this);
    this.onChangeFeatureName = this.onChangeFeatureName.bind(this);
    this.onChangeOwner = this.onChangeOwner.bind(this);
    const { api } = config;
    axios.defaults.baseURL = `http://${api.host}:${api.port}`;
    axios.defaults.withCredentials = true;
  }

  createFeature() {
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
    const { featureId, featureName, username } = this.state;
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
        </Modal.Content>
        <Modal.Actions>
          <Button onClick={closeAction}>Cancel</Button>
          <Button color='green' disabled={disabled} onClick={this.createFeature}>Create</Button>
        </Modal.Actions>
      </Modal>
    );
  }
}

export default ModalCreateFeature;
