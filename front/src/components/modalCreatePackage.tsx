import axios from "axios";
import { config } from "randevu-shared/dist/config";
import { Component } from "react";
import { Button, Form, Message, Modal, ModalProps } from "semantic-ui-react";

type Props = {} & ModalProps;

type State = {
  packageName: string,
  operatorList: Array<{ key: string, value: string, text: string }>,
  operatorName: string,
  packageList: Array<{ key: string, value: string, text: string }>,
  previousPackageName: string,
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
      operatorList: [],
      operatorName: '',
      packageList: [],
      previousPackageName: '',
      owner: '',
      loading: false,
      messageVisible: false,
      positive: false,
      negative: false,
      messageContent: '',
    }
    this.createPackage = this.createPackage.bind(this);
    this.onChangeOperator = this.onChangeOperator.bind(this);
    this.onChangePackageName = this.onChangePackageName.bind(this);
    this.onChangePreviousPackageName = this.onChangePreviousPackageName.bind(this);
    this.onChangeOwner = this.onChangeOwner.bind(this);
    const { api } = config;
    axios.defaults.baseURL = `http://${api.host}:${api.port}`;
    axios.defaults.withCredentials = true;
  }

  createPackage() {
    const { loading, packageName, operatorName, owner } = this.state;
    if (loading) {
      return;
    }
    this.setState({ loading: true });
    axios.post('/packages/', { packageName, operatorName, owner }).then((value) => {
      this.setState({ loading: false, messageVisible: true, positive: true, negative: false });
    }).catch((reason) => {
      const messageContent = reason?.response?.data?.reason ?? 'Maybe due to internal server error';
      this.setState({ loading: false, messageVisible: true, positive: false, negative: true, messageContent });
    })
  }

  init() {
    axios.get('/operators').then((value) => {
      const operatorNameWithOwnerList = value.data as Array<{operatorName: string, owner: string}>;
      const operatorList = operatorNameWithOwnerList.map((operatorNameWithOwner) => {
        const { operatorName } = operatorNameWithOwner;
        return { key: operatorName, value: operatorName, text: operatorName };
      });
      this.setState({ operatorList, packageList: [] });
    }).catch((reason) => {
      console.error(reason);
    });
  }

  onChangeOperator(e: React.ChangeEvent<HTMLSelectElement>) {
    const { value: operatorName } = e.target;
    this.setState({ operatorName });
    axios.get('/packages', { params: { operatorNameList: [operatorName] } }).then((value) => {
      const { data: packageInfoList } = value;
      const packageList = packageInfoList.map((packageInfo : any /* TODO */) => {
        const { packageName } = packageInfo;
        return { key: packageName, value: packageName, text: packageName };
      });
      this.setState({ packageList });
    }).catch((reason) => {
      console.error(reason);
    });
  }

  onChangePackageName(e: React.ChangeEvent<HTMLInputElement>) {
    const packageName = e.target.value;
    this.setState({ packageName });
  }

  onChangePreviousPackageName(e: React.ChangeEvent<HTMLSelectElement>) {
    const { value: previousPackageName } = e.target;
    this.setState({ previousPackageName });
  }

  onChangeOwner(e: React.ChangeEvent<HTMLInputElement>) {
    const owner = e.target.value;
    this.setState({ owner });
  }

  render() {
    const { closeAction, ...modalProps } = this.props;
    const { packageName, operatorList, operatorName, packageList, previousPackageName, owner, loading, messageVisible, positive, negative, messageContent } = this.state;
    const disabled = !packageName || !operatorName || !owner;
    return (
      <Modal {...modalProps} onClose={closeAction}>
        <Modal.Header>Create a package</Modal.Header>
        <Modal.Content>
          <Form onSubmit={this.createPackage}>
            <Form.Field error={!packageName}>
              <label>Package name</label>
              <input type='text' value={packageName} onChange={this.onChangePackageName} />
            </Form.Field>
            <Form.Field error={!operatorName}>
              <label>Operator</label>
              <select disabled={!operatorList.length} value={operatorName} onChange={this.onChangeOperator}>
                <option value=''></option>
                {
                  operatorList.map((operator) => {
                    const { key, value, text } = operator;
                    return (
                      <option key={key} value={value}>{text}</option>
                    );
                  })
                }
              </select>
            </Form.Field>
            <Form.Field>
              <label>Previous package</label>
              <select disabled={!packageList.length} value={previousPackageName} onChange={this.onChangePreviousPackageName}>
                <option value=''></option>
                {
                  packageList.map((pkg) => {
                    const { key, value, text } = pkg;
                    return (
                      <option key={key} value={value}>{text}</option>
                    );
                  })
                }
              </select>
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
