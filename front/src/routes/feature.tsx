import axios from "axios";
import { Component } from "react";
import { Accordion, Button, Container, Dimmer, Form, Header, Icon, Loader, Segment, Table } from "semantic-ui-react";
import { config } from 'randevu-shared/dist/config';
import ModalCreateFeature from "../components/modalCreateFeature";

type FeatureInfo = {
  featureId: string,
  featureName: string,
  owner: string,
};

type Props = {
  onUpdateAuthenticationResult: (authenticated: boolean, role: string | undefined) => void;
  role: string | undefined;
};
type State = {
  loading: boolean,
  featureInfoList: FeatureInfo[],
  openModalCreateFeature: boolean,
  openSearch: boolean,
};

class Feature extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state ={
      loading: false,
      featureInfoList: [],
      openModalCreateFeature: false,
      openSearch: true,
    };
    this.openModalCreateFeature = this.openModalCreateFeature.bind(this);
    this.toggleSearch = this.toggleSearch.bind(this);
    const { api } = config;
    axios.defaults.baseURL = `http://${api.host}:${api.port}`;
    axios.defaults.withCredentials = true;
  }

  componentDidMount() {
    const { onUpdateAuthenticationResult } = this.props;
    this.setState({ loading: true });
    axios.get('/authenticate').then(() => {
      axios.get('/features').then((value) => {
        const featureInfoList = value.data;
        this.setState({ loading: false, featureInfoList });
      }).catch((reason) => {
        this.setState({ loading: false });
      });
    }).catch((reason) => {
      this.setState({ loading: false });
      onUpdateAuthenticationResult(false, undefined);
    });
  }

  openModalCreateFeature(open: boolean) {
    this.setState({ openModalCreateFeature: open });
  }

  toggleSearch() {
    this.setState((prevState) => {
      const { openSearch } = prevState;
      return { openSearch: !openSearch };
    });
  }

  render() {
    const { role } = this.props;
    const { loading, featureInfoList, openModalCreateFeature, openSearch } = this.state;
    return (
      <Container>
        <Header as='h1'>Features</Header>
        <Segment>

          <Accordion>
            <Accordion.Title active={openSearch} onClick={this.toggleSearch}>
              <Icon name='dropdown' />
              Search
            </Accordion.Title>
            <Accordion.Content active={openSearch}>
              <Form>
                <Form.Group>
                  <Form.Field inline>
                    <label>Feature ID</label>
                    <input type='text' />
                  </Form.Field>
                  <Form.Field inline>
                    <label>Feature name</label>
                    <input type='text' />
                  </Form.Field>
                  <Form.Field inline>
                    <label>Owner</label>
                    <input type='text' />
                  </Form.Field>
                </Form.Group>
                <Form.Field>
                  <Button icon labelPosition='left'>
                    <Icon name='search' />
                    Search
                  </Button>
                </Form.Field>
              </Form>
            </Accordion.Content>
          </Accordion>
        </Segment>
        <Table celled compact selectable striped>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>Feature ID</Table.HeaderCell>
              <Table.HeaderCell>Feature name</Table.HeaderCell>
              <Table.HeaderCell>Owner</Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {
              role === 'admin' ? (
                <Table.Row active>
                  <Table.Cell colSpan={3} textAlign='center'>
                    <Button icon labelPosition='left' size='tiny' onClick={() => this.openModalCreateFeature(true)}>
                      <Icon name='plus' />
                      Create a feature
                    </Button>
                  </Table.Cell>
                </Table.Row>
              ) : <></>
            }
            {
              featureInfoList.map((featureInfo) => {
                const { featureId, featureName, owner } = featureInfo;
                return (
                  <Table.Row key={featureId}>
                    <Table.Cell>{featureId}</Table.Cell>
                    <Table.Cell>{featureName}</Table.Cell>
                    <Table.Cell>{owner}</Table.Cell>
                  </Table.Row>
                );
              })
            }
          </Table.Body>
        </Table>
        <ModalCreateFeature
          open={openModalCreateFeature}
          closeAction={() => this.openModalCreateFeature(false)}
        />
        <Dimmer active={loading}>
          <Loader />
        </Dimmer>
      </Container>
    );
  }
}

export default Feature;
