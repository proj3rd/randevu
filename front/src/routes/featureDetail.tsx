import axios from "axios";
import { config } from 'randevu-shared/dist/config';
import { Component } from "react";
import { RouteComponentProps, withRouter } from "react-router-dom";
import { Container, Dimmer, Form, Header, Loader } from "semantic-ui-react";

type Props = {
  onUpdateAuthenticationResult: (authenticated: boolean, role: string | undefined) => void;
};

type State = {
  loading: boolean,
  notFound: boolean,
  featureId: string,
  featureName: string,
  versionList: string[],
};

class FeatureDetail extends Component<Props & RouteComponentProps, State> {
  constructor(props: Props & RouteComponentProps) {
    super(props);
    this.state = {
      loading: false,
      notFound: false,
      featureId: '',
      featureName: '',
      versionList: [],
    };
    const { api } = config;
    axios.defaults.baseURL = `http://${api.host}:${api.port}`;
    axios.defaults.withCredentials = true;
  }

  componentDidMount() {
    const { onUpdateAuthenticationResult } = this.props;
    this.setState({ loading: true });
    axios.get('/authenticate').then(() => {
      this.setState({ loading: false });
    }).catch((reason) => {
      this.setState({ loading: false });
      onUpdateAuthenticationResult(false, undefined);
    });
  }

  render() {
    const { loading, notFound, featureId, featureName, versionList } = this.state;
    if (notFound) {
      return (
        <Container>
          Feature not found
        </Container>
      );
    }
    return (
      <Container>
        <Header as='h1'>{featureId} {featureName}</Header>
        <Form>
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
        </Form>
        <Header as='h2'>Release information</Header>
        <Header as='h2'>Change list</Header>
        <Header as='h2'>Requirements</Header>
        <Dimmer active={loading}>
          <Loader />
        </Dimmer>
      </Container>
    );
  }
}

export default withRouter(FeatureDetail);
