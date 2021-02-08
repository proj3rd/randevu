import { Component } from "react";
import { Button, Form, Modal, ModalProps } from "semantic-ui-react";

type Props = {} & ModalProps;

type State = {
  featureId: string,
  featureName: string,
  owner: string,
};

class ModalCreateFeature extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      featureId: '',
      featureName: '',
      owner: '',
    }
    this.onChangeFeatureId = this.onChangeFeatureId.bind(this);
    this.onChangeFeatureName = this.onChangeFeatureName.bind(this);
    this.onChangeOwner = this.onChangeOwner.bind(this);
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
    const owner = e.target.value;
    this.setState({ owner });
  }

  render() {
    const { closeAction, ...modalProps } = this.props;
    const { featureId, featureName, owner } = this.state;
    const disabled = !featureId || !featureName || !owner;
    return (
      <Modal {...modalProps} onClose={closeAction}>
        <Modal.Header>Create a feature</Modal.Header>
        <Modal.Content>
          <Form>
            <Form.Field error={!featureId}>
              <label>Feature ID</label>
              <input type='text' value={featureId} onChange={this.onChangeFeatureId} />
            </Form.Field>
            <Form.Field error={!featureName}>
              <label>Feature name</label>
              <input type='text' value={featureName} onChange={this.onChangeFeatureName} />
            </Form.Field>
            <Form.Field error={!owner}>
              <label>Owner</label>
              <input type='text' value={owner} onChange={this.onChangeOwner} />
            </Form.Field>
          </Form>
        </Modal.Content>
        <Modal.Actions>
          <Button color='red' onClick={closeAction}>Cancel</Button>
          <Button color='green' disabled={disabled}>Create</Button>
        </Modal.Actions>
      </Modal>
    );
  }
}

export default ModalCreateFeature;
