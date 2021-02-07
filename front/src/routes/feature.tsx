import axios from "axios";
import { Component } from "react";
import { Container, Table } from "semantic-ui-react";
import { config } from 'randevu-shared/dist/config';

type FeatureInfo = {
  featureId: string,
  featureName: string,
  owner: string,
};

type Props = {
  updateAuthenticationResult: (authenticated: boolean, role: string | undefined) => void;
};
type State = {
  featureInfoList: FeatureInfo[],
};

class Feature extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state ={
      featureInfoList: [],
    };
    const { api } = config;
    axios.defaults.baseURL = `http://${api.host}:${api.port}`;
    axios.defaults.withCredentials = true;
  }

  componentDidMount() {
    const { updateAuthenticationResult } = this.props;
    axios.get('/authenticate').then(() => {
      axios.get('/features').then((value) => {
        const featureInfoList = value.data;
        this.setState({ featureInfoList });
      }).catch((reason) => {});
    }).catch((reason) => {
      updateAuthenticationResult(false, undefined);
    });
  }

  render() {
    const { featureInfoList } = this.state;
    return (
      <Container>
        <Header as='h1'>Features</Header>
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
      </Container>
    );
  }
}

export default Feature;
