import axios from "axios";
import { Component } from "react";
import { Accordion, Button, Container, Dimmer, Form, Header, Icon, Label, Loader, Message, Segment, Table } from "semantic-ui-react";
import { config } from 'randevu-shared/dist/config';
import ModalCreatePackage from "../components/modalCreatePackage";

type PackageInfo = {
  featureId: string,
  packageName: string,
  owner: string,
};

type Props = {
  onUpdateAuthenticationResult: (authenticated: boolean, role: string | undefined) => void;
  role: string | undefined;
};

type State = {
  loading: boolean,
  featureInfoList: PackageInfo[],
  openModalCreatePackage: boolean,
  openSearch: boolean,
  packageName: string,
  owner: string,
  messageVisible: boolean,
};

class Package extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state ={
      loading: false,
      featureInfoList: [],
      openModalCreatePackage: false,
      openSearch: true,
      packageName: '',
      owner: '',
      messageVisible: false,
    };
    this.onChangepackageName = this.onChangepackageName.bind(this);
    this.onChangeOwner = this.onChangeOwner.bind(this);
    this.openModalCreatePackage = this.openModalCreatePackage.bind(this);
    this.search = this.search.bind(this);
    this.toggleSearch = this.toggleSearch.bind(this);
    const { api } = config;
    axios.defaults.baseURL = `http://${api.host}:${api.port}`;
    axios.defaults.withCredentials = true;
  }

  componentDidMount() {
    const { onUpdateAuthenticationResult } = this.props;
    this.setState({ loading: true });
    axios.get('/authenticate').then(() => {
      this.setState({ loading: false });
    }).catch(() => {
      this.setState({ loading: false });
      onUpdateAuthenticationResult(false, undefined);
    });
  }

  onChangepackageName(e: React.ChangeEvent<HTMLInputElement>) {
    const packageName = e.target.value;
    this.setState({ packageName });
  }

  onChangeOwner(e: React.ChangeEvent<HTMLInputElement>) {
    const owner = e.target.value;
    this.setState({ owner });
  }

  openModalCreatePackage(open: boolean) {
    this.setState({ openModalCreatePackage: open });
  }

  search() {
    const { packageName, owner } = this.state;
    this.setState({ loading: true });
    axios.get('/packages', {
      params: { packageName, owner }
    }).then((value) => {
      const featureInfoList = value.data;
      this.setState({ loading: false, featureInfoList, messageVisible: false });
    }).catch((reason) => {
      console.error(reason);
      this.setState({ loading: false, messageVisible: true });
    });
  }

  toggleSearch() {
    this.setState((prevState) => {
      const { openSearch } = prevState;
      return { openSearch: !openSearch };
    });
  }

  render() {
    const { role } = this.props;
    const { loading, featureInfoList, openModalCreatePackage, openSearch, packageName, messageVisible } = this.state;
    return (
      <Container>
        <Header as='h1'>Package</Header>
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
                  <input type='text' value={packageName} onChange={this.onChangepackageName} />
                </Form.Field>
                <Form.Field inline>
                  <label>Operators</label>
                  <Label>SK Telecom</Label>
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
        <Table celled compact selectable striped>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>Main package</Table.HeaderCell>
              <Table.HeaderCell>Sub package</Table.HeaderCell>
              <Table.HeaderCell>Operator</Table.HeaderCell>
              <Table.HeaderCell>Owner</Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {
              role === 'admin' ? (
                <Table.Row active>
                  <Table.Cell colSpan={4} textAlign='center'>
                    <Button icon labelPosition='left' size='tiny' onClick={() => this.openModalCreatePackage(true)}>
                      <Icon name='plus' />
                      Create a package
                    </Button>
                  </Table.Cell>
                </Table.Row>
              ) : <></>
            }
            {
              featureInfoList.map((featureInfo) => {
                const { featureId, packageName, owner } = featureInfo;
                return (
                  <Table.Row key={featureId}>
                    <Table.Cell>{featureId}</Table.Cell>
                    <Table.Cell>{packageName}</Table.Cell>
                    <Table.Cell>{owner}</Table.Cell>
                  </Table.Row>
                );
              })
            }
          </Table.Body>
        </Table>
        <ModalCreatePackage
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
