import axios from "axios";
import { config } from 'randevu-shared/dist/config';
import { Component } from "react";
import { RouteComponentProps, withRouter } from "react-router-dom";
import { Container, Dimmer, Form, Header, Loader, Table } from "semantic-ui-react";

type Props = {
  onUpdateAuthenticationResult: (username: string | undefined, role: string | undefined) => void;
};

type State = {
  loading: boolean,
  reason: string,
  featureId: string,
  featureName: string,
  owner: string,
  loadingVersionList: boolean,
  versionList: string[],
};

class FeatureDetail extends Component<Props & RouteComponentProps, State> {
  constructor(props: Props & RouteComponentProps) {
    super(props);
    this.state = {
      loading: false,
      reason: '',
      featureId: '',
      featureName: '',
      owner: '',
      loadingVersionList: false,
      versionList: [],
    };
    const { api } = config;
    axios.defaults.baseURL = `http://${api.host}:${api.port}`;
    axios.defaults.withCredentials = true;
  }

  componentDidMount() {
    const { onUpdateAuthenticationResult, location } = this.props;
    const { pathname } = location;
    const lastIndexOfSlash = pathname.lastIndexOf('/');
    const featureId = pathname.substring(lastIndexOfSlash + 1);
    this.setState({ loading: true });
    axios.get('/authenticate').then(() => {
      axios.get(`/features/${featureId}`).then((value) => {
        const { featureId, featureName, owner } = value.data;
        document.title = `RANdevU :: ${featureId} ${featureName}`;
        this.setState({ loading: false, featureId, featureName, owner });
        axios.get(`/features/${featureId}/versions`).then((value) => {
          const { data: versionList } = value;
          (versionList as number[]).sort((a, b) => a - b);
          this.setState({ loadingVersionList: false, versionList });
        }).catch((reason) => {
          console.error(reason);
        });
      }).catch((e) => {
        console.error(e);
        const status = e.response?.status;
        const reason = status === 403 ? 'Not authorized to access this feature' :
          status === 404 ? 'Feature not found' :
          'Maybe due to internal server failure';
        this.setState({ loading: false, reason });
      })
    }).catch((reason) => {
      this.setState({ loading: false });
      onUpdateAuthenticationResult(undefined, undefined);
    });
  }

  componentWillUnmount() {
    document.title = 'RANdevU';
  }

  render() {
    const { loading, reason, featureId, featureName, loadingVersionList, versionList } = this.state;
    if (reason) {
      return (
        <Container>
          {reason}
        </Container>
      );
    }
    return (
      <Container>
        <Header as='h1'>{featureId} {featureName}</Header>
        <Form>
          <Form.Group>
            <Form.Button>Version map</Form.Button>
            <Form.Button>Generate release history</Form.Button>
          </Form.Group>
          <Dimmer.Dimmable>
            <Form.Field>
              <label>Version</label>
              <select>
                <option value='' />
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
        <Header as='h2'>Releases</Header>
        <Dimmer.Dimmable>
          <Table>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell>Package</Table.HeaderCell>
                <Table.HeaderCell>Operator</Table.HeaderCell>
              </Table.Row>
            </Table.Header>
          </Table>
          <Dimmer active>
            <Loader />
          </Dimmer>
        </Dimmer.Dimmable>
        <Header as='h2'>Changes</Header>
        <Dimmer.Dimmable>
          <Table>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell>Description</Table.HeaderCell>
                <Table.HeaderCell>Before change</Table.HeaderCell>
                <Table.HeaderCell>After change</Table.HeaderCell>
                <Table.HeaderCell>Operators</Table.HeaderCell>
              </Table.Row>
            </Table.Header>
          </Table>
          <Dimmer active>
            <Loader />
          </Dimmer>
        </Dimmer.Dimmable>
        <Header as='h2'>Requirements</Header>
        <Dimmer.Dimmable>
          <Dimmer active>
            <Loader />
          </Dimmer>
        </Dimmer.Dimmable>
        <Dimmer active={loading}>
          <Loader />
        </Dimmer>
      </Container>
    );
  }
}

export default withRouter(FeatureDetail);
