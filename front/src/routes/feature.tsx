import { Component } from "react";
import { Container, Table } from "semantic-ui-react";

type FeatureInfo = {
  featureId: string,
  featureName: string,
  owner: string,
};

type Props = {};
type State = {
  featureInfoList: FeatureInfo[],
};

class Feature extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state ={
      featureInfoList: [],
    };
  }

  render() {
    const { featureInfoList } = this.state;
    return (
      <Container>
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
