import axios from "axios";
import { config } from "randevu-shared/dist/config";
import { ApiVersion } from "randevu-shared/dist/types";
import { Component } from "react";
import { Button, Dimmer, Form, Loader, Message, Modal, ModalProps } from "semantic-ui-react";

type Props = {
  featureId: string;
} & ModalProps;

type State = {
  loading: boolean,
  loadingVersionList: boolean,
  versionList: number[],
  version: number,
  messageVisible: boolean,
  positive: boolean,
  negative: boolean,
  messageContent: string,
};

class ModalCreateFeatureVersion extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      loading: false,
      loadingVersionList: false,
      versionList: [],
      version: 0,
      messageVisible: false,
      positive: false,
      negative: false,
      messageContent: '',
    }
    this.createFeatureVersion = this.createFeatureVersion.bind(this);
    this.onChangeVersion = this.onChangeVersion.bind(this);
    const { api } = config;
    axios.defaults.baseURL = `http://${api.host}:${api.port}`;
    axios.defaults.withCredentials = true;
  }

  createFeatureVersion() {
    const { featureId } = this.props;
    const { loading, version: previousVersion } = this.state;
    if (loading && !previousVersion) {
      return;
    }
    this.setState({ loading: true });
    axios.post(`/features/${featureId}/versions`, { previousVersion }).then((value) => {
      this.setState({ loading: false, messageVisible: true, positive: true, negative: false });
    }).catch((reason) => {
      const messageContent = reason?.response?.data?.reason ?? 'Maybe due to internal server error';
      this.setState({ loading: false, messageVisible: true, positive: false, negative: true, messageContent });
    })
  }

  init() {
    this.setState({ loadingVersionList: true });
    const { featureId } = this.props;
    axios.get(`/features/${featureId}/versions`).then((value) => {
      const versionList = (value.data as ApiVersion[]).map((apiVersion) => {
        return apiVersion.version;
      });
      this.setState({ loadingVersionList: false, versionList });
    }).catch((reason) => {
      console.error(reason);
    })
  }

  onChangeVersion(e: React.ChangeEvent<HTMLSelectElement>) {
    const version = +e.target.value;
    this.setState({ version });
  }

  render() {
    const { closeAction, ...modalProps } = this.props;
    const { loading, loadingVersionList, versionList, version, messageVisible, positive, negative, messageContent } = this.state;
    return (
      <Modal {...modalProps} onClose={closeAction}>
        <Modal.Header>Create a new version</Modal.Header>
        <Modal.Content>
          <Form onSubmit={this.createFeatureVersion}>
            <Dimmer.Dimmable>
              <Form.Field error={!version}>
                <label>Previous version</label>
                <select value={version} onChange={this.onChangeVersion}>
                  <option value={0} />
                  {
                    versionList.map((version) => (
                      <option key={version} value={version}>{version}</option>
                    ))
                  }
                </select>
              </Form.Field>
              <Dimmer active={loadingVersionList}>
                  <Loader />
              </Dimmer>
            </Dimmer.Dimmable>
          </Form>
          {
            messageVisible && positive ? (
              <Message positive>
                <Message.Header>Success</Message.Header>
                <Message.Content>New version has been created</Message.Content>
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
          <Button color='green' disabled={!version} onClick={this.createFeatureVersion} loading={loading}>Create</Button>
        </Modal.Actions>
      </Modal>
    );
  }
}

export default ModalCreateFeatureVersion;
