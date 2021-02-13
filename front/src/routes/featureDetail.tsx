import axios from "axios";
import { config } from "randevu-shared/dist/config";
import { ApiVersion } from "randevu-shared/dist/types";
import { Component, createRef, RefObject } from "react";
import { RouteComponentProps, withRouter } from "react-router-dom";
import {
  Container,
  Dimmer,
  Form,
  Header,
  Icon,
  Loader,
  Table,
} from "semantic-ui-react";
import ModalCreateFeatureVersion from "../components/modalCreateFeatureVersion";

type Change = {
  description: string;
  beforeChange: string;
  afterChange: string;
};

type Props = {
  onUpdateAuthenticationResult: (
    username: string | undefined,
    role: string | undefined
  ) => void;
};

type State = {
  loading: boolean;
  reason: string;
  featureId: string;
  featureName: string;
  owner: string;
  loadingVersionList: boolean;
  versionList: ApiVersion[];
  version: number;
  openModalCreateFeatureVersion: boolean;
  loadingChange: boolean;
  revisionChange: number | undefined;
  changeList: Change[];
};

class FeatureDetail extends Component<Props & RouteComponentProps, State> {
  private refModalCreateFeatureVersion: RefObject<ModalCreateFeatureVersion>;

  constructor(props: Props & RouteComponentProps) {
    super(props);
    this.state = {
      loading: true,
      reason: "",
      featureId: "",
      featureName: "",
      owner: "",
      loadingVersionList: true,
      versionList: [],
      version: 0,
      openModalCreateFeatureVersion: false,
      loadingChange: true,
      revisionChange: undefined,
      changeList: [],
    };
    const { api } = config;
    axios.defaults.baseURL = `http://${api.host}:${api.port}`;
    axios.defaults.withCredentials = true;
    this.refModalCreateFeatureVersion = createRef();
    this.onChangeVersion = this.onChangeVersion.bind(this);
    this.openModalCreateFeatureVersion = this.openModalCreateFeatureVersion.bind(
      this
    );
  }

  componentDidMount() {
    const { onUpdateAuthenticationResult, location } = this.props;
    const { pathname } = location;
    const lastIndexOfSlash = pathname.lastIndexOf("/");
    const featureId = pathname.substring(lastIndexOfSlash + 1);
    axios
      .get("/authenticate")
      .then(() => {
        axios
          .get(`/features/${featureId}`)
          .then((value) => {
            const { featureId, featureName, owner } = value.data;
            document.title = `RANdevU :: ${featureId} ${featureName}`;
            this.setState({ loading: false, featureId, featureName, owner });
            axios
              .get(`/features/${featureId}/versions`)
              .then((value) => {
                const versionList = value.data as ApiVersion[];
                versionList.sort((a, b) => a.version - b.version);
                const versionLast = versionList[versionList.length - 1].version;
                this.setState({
                  loadingVersionList: false,
                  versionList,
                  version: versionLast,
                });
                // Parallel: release, changes, requirements, etc.
                axios
                  .get(`/features/${featureId}/changes/${versionLast}`)
                  .then((value) => {
                    const { revision: revisionChange, changeList } = value.data;
                    this.setState({
                      loadingChange: false,
                      revisionChange,
                      changeList,
                    });
                  })
                  .catch((reason) => {
                    console.error(reason);
                  });
              })
              .catch((reason) => {
                console.error(reason);
              });
          })
          .catch((e) => {
            console.error(e);
            const status = e.response?.status;
            const reason =
              status === 403
                ? "Not authorized to access this feature"
                : status === 404
                ? "Feature not found"
                : "Maybe due to internal server failure";
            this.setState({ loading: false, reason });
          });
      })
      .catch((reason) => {
        this.setState({ loading: false });
        onUpdateAuthenticationResult(undefined, undefined);
      });
  }

  componentWillUnmount() {
    document.title = "RANdevU";
  }

  onChangeVersion(e: React.ChangeEvent<HTMLSelectElement>) {
    const version = +e.target.value;
    this.setState({ version });
  }

  openModalCreateFeatureVersion(open: boolean) {
    this.setState({ openModalCreateFeatureVersion: open });
    if (open) {
      this.refModalCreateFeatureVersion.current?.init();
    }
  }

  render() {
    const {
      loading,
      reason,
      featureId,
      featureName,
      loadingVersionList,
      versionList,
      version,
      openModalCreateFeatureVersion,
      loadingChange,
      revisionChange,
      changeList,
    } = this.state;
    if (reason) {
      return <Container>{reason}</Container>;
    }
    return (
      <Container>
        <Header as="h1">
          {featureId} {featureName}
        </Header>
        <Form>
          <Dimmer.Dimmable>
            <Form.Group>
              <Form.Field inline>
                <label>Version</label>
                <select value={version} onChange={this.onChangeVersion}>
                  <option value={0} />
                  {versionList.map((apiVersin) => (
                    <option key={apiVersin.version} value={apiVersin.version}>
                      {apiVersin.version}
                    </option>
                  ))}
                </select>
              </Form.Field>
              <Form.Button icon labelPosition="left">
                <Icon name="code branch" />
                Version map
              </Form.Button>
              <Form.Button
                icon
                labelPosition="left"
                onClick={() => this.openModalCreateFeatureVersion(true)}
              >
                <Icon name="plus" />
                Create a new version
              </Form.Button>
            </Form.Group>
            <Dimmer active={loadingVersionList}>
              <Loader />
            </Dimmer>
          </Dimmer.Dimmable>
        </Form>
        <Header as="h2">Releases</Header>
        <Form>
          <Form.Button icon labelPosition="left">
            <Icon name="list" />
            Generate release history
          </Form.Button>
        </Form>
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
        <Header as="h2">Changes</Header>
        Revision: {revisionChange}
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
            <Table.Body>
              {changeList.map((change, index) => {
                const { description, beforeChange, afterChange } = change;
                return (
                  <Table.Row key={index}>
                    <Table.Cell>{description}</Table.Cell>
                    <Table.Cell>{beforeChange}</Table.Cell>
                    <Table.Cell>{afterChange}</Table.Cell>
                  </Table.Row>
                );
              })}
            </Table.Body>
          </Table>
          <Dimmer active={loadingChange}>
            <Loader />
          </Dimmer>
        </Dimmer.Dimmable>
        <Header as="h2">Requirements</Header>
        <Dimmer.Dimmable>
          <Dimmer active>
            <Loader />
          </Dimmer>
        </Dimmer.Dimmable>
        <Dimmer active={loading}>
          <Loader />
        </Dimmer>
        <ModalCreateFeatureVersion
          ref={this.refModalCreateFeatureVersion}
          open={openModalCreateFeatureVersion}
          closeAction={() => this.openModalCreateFeatureVersion(false)}
          featureId={featureId}
        />
      </Container>
    );
  }
}

export default withRouter(FeatureDetail);
