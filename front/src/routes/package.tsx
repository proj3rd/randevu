import axios from "axios";
import { Component, createRef } from "react";
import { Accordion, Button, Container, Dimmer, Form, Header, Icon, Label, Loader, Message, Segment, Table } from "semantic-ui-react";
import { config } from 'randevu-shared/dist/config';
import ModalCreatePackage from "../components/modalCreatePackage";
import produce from "immer";

type OperatorLabel = {
  name: string,
  checked: boolean,
};

type PackageInfo = {
  _id: string;
  name: string,
  main?: {
    _id: string;
    name: string;
  };
  operator?: {
    _id: string;
    name: string;
  };
  owner?: {
    _id: string;
    username: string;
  };
};

type Props = {
  onUpdateAuthenticationResult: (username: string | undefined, role: string | undefined) => void;
  role: string | undefined;
};

type State = {
  loading: boolean,
  operatorLabelList: OperatorLabel[],
  packageInfoList: PackageInfo[],
  openModalCreatePackage: boolean,
  openSearch: boolean,
  packageName: string,
  owner: string,
  messageVisible: boolean,
};

class Package extends Component<Props, State> {
  private refModalCreatePackage: React.RefObject<ModalCreatePackage>;

  constructor(props: Props) {
    super(props);
    this.state ={
      loading: false,
      operatorLabelList: [],
      packageInfoList: [],
      openModalCreatePackage: false,
      openSearch: true,
      packageName: '',
      owner: '',
      messageVisible: false,
    };
    this.refModalCreatePackage = createRef();
    this.onChangePackageName = this.onChangePackageName.bind(this);
    this.onChangeOwner = this.onChangeOwner.bind(this);
    this.openModalCreatePackage = this.openModalCreatePackage.bind(this);
    this.search = this.search.bind(this);
    this.toggleLabel = this.toggleLabel.bind(this);
    this.toggleSearch = this.toggleSearch.bind(this);
    const { api } = config;
    axios.defaults.baseURL = `http://${api.host}:${api.port}`;
    axios.defaults.withCredentials = true;
  }

  componentDidMount() {
    const { onUpdateAuthenticationResult } = this.props;
    this.setState({ loading: true });
    axios.get('/authenticate').then(() => {
      axios.get('/operators').then((value) => {
        const { data: operatorInfoList } = value;
        const operatorLabelList: OperatorLabel[] = operatorInfoList.map((operatorInfo: any /* TODO */) => {
          const { name } = operatorInfo;
          return { name, checked: false };
        });
        this.setState({ loading: false, operatorLabelList });
      }).catch((reason) => {
        console.error(reason);
        this.setState({ loading: false });
      })
    }).catch(() => {
      this.setState({ loading: false });
      onUpdateAuthenticationResult(undefined, undefined);
    });
  }

  onChangePackageName(e: React.ChangeEvent<HTMLInputElement>) {
    const packageName = e.target.value;
    this.setState({ packageName });
  }

  onChangeOwner(e: React.ChangeEvent<HTMLInputElement>) {
    const owner = e.target.value;
    this.setState({ owner });
  }

  openModalCreatePackage(open: boolean) {
    this.setState({ openModalCreatePackage: open });
    this.refModalCreatePackage.current?.init();
  }

  search() {
    this.setState({ loading: true });
    const { packageName, operatorLabelList, owner } = this.state;
    const operatorNameList = operatorLabelList.filter((operatorLabel) => {
      return operatorLabel.checked;
    }).map((operatorLabel) => operatorLabel.name);
    axios.get('/packages?include[]=operator&include[]=owner', {
      params: { packageName, operatorNameList, owner }
    }).then((value) => {
      const packageInfoList = value.data;
      this.setState({ loading: false, packageInfoList, messageVisible: false });
    }).catch((reason) => {
      console.error(reason);
      this.setState({ loading: false, messageVisible: true });
    });
  }

  toggleLabel(name: string) {
    const prevState = this.state;
    const nextState = produce(prevState, (draftState) => {
      const { operatorLabelList } = draftState;
      const operatorLabelFound = operatorLabelList.find((operatorLabel) => {
        return operatorLabel.name === name;
      });
      if (operatorLabelFound) {
        operatorLabelFound.checked = !operatorLabelFound.checked;
      }
    });
    this.setState(nextState);
  }

  toggleSearch() {
    this.setState((prevState) => {
      const { openSearch } = prevState;
      return { openSearch: !openSearch };
    });
  }

  render() {
    const { role } = this.props;
    const { loading, operatorLabelList, packageInfoList, openModalCreatePackage, openSearch, packageName, messageVisible } = this.state;
    return (
      <Container>
        <Header as='h1'>Packages</Header>
        <Segment>
          <Accordion>
            <Accordion.Title active={openSearch} onClick={this.toggleSearch}>
              <Icon name='dropdown' />
              Search
            </Accordion.Title>
            <Accordion.Content active={openSearch}>
              <Form>
                <Form.Field inline>
                  <label>Package name</label>
                  <input type='text' value={packageName} onChange={this.onChangePackageName} />
                </Form.Field>
                <Form.Field inline>
                  <label>Operators</label>
                  {
                    operatorLabelList.map((operatorLabel) => {
                      const { name, checked } = operatorLabel;
                      const color = checked ? 'blue' : undefined;
                      const icon = checked ? 'check' : 'minus';
                      return (
                        <Label as='a' key={name} onClick={() => this.toggleLabel(name)} color={color}>
                          <Icon name={icon} />
                          {name}
                        </Label>
                    )})
                  }
                </Form.Field>
                <Form.Field>
                  <Button icon labelPosition='left' onClick={this.search}>
                    <Icon name='search' />
                    Search
                  </Button>
                </Form.Field>
              </Form>
            </Accordion.Content>
          </Accordion>
        </Segment>
        {
          messageVisible ? (
            <Message visible={messageVisible} negative>
              <Message.Header>Oops</Message.Header>
              <Message.Content>Maybe due to internal server error</Message.Content>
            </Message>
          ) : <></>
        }
        <Table celled selectable>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>Package name</Table.HeaderCell>
              <Table.HeaderCell>Operator</Table.HeaderCell>
              <Table.HeaderCell>Owner</Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {
              role === 'admin' ? (
                <Table.Row active>
                  <Table.Cell colSpan={3} textAlign='center'>
                    <Button icon labelPosition='left' onClick={() => this.openModalCreatePackage(true)}>
                      <Icon name='plus' />
                      Create a package
                    </Button>
                  </Table.Cell>
                </Table.Row>
              ) : <></>
            }
            {
              packageInfoList.map((packageInfo) => {
                const { name: packageName, operator, owner } = packageInfo;
                return (
                  <Table.Row key={packageName}>
                    <Table.Cell>{packageName}</Table.Cell>
                    <Table.Cell>{operator ? operator.name : ''}</Table.Cell>
                    <Table.Cell>{owner ? owner.username : ''}</Table.Cell>
                  </Table.Row>
                );
              })
            }
          </Table.Body>
        </Table>
        <ModalCreatePackage
          ref={this.refModalCreatePackage}
          open={openModalCreatePackage}
          closeAction={() => this.openModalCreatePackage(false)}
        />
        <Dimmer active={loading}>
          <Loader />
        </Dimmer>
      </Container>
    );
  }
}

export default Package;
