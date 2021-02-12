import axios from "axios";
import { Component } from "react";
import { Button, Container, Dimmer, Header, Icon, Loader, Table } from "semantic-ui-react";
import { config } from 'randevu-shared/dist/config';
import ModalRegisterOperator from "../components/modalRegisterOperator";

type OperatorInfo = {
  operatorName: string,
  owner: string,
};

type Props = {
  onUpdateAuthenticationResult: (authenticated: boolean, role: string | undefined) => void;
  role: string | undefined;
};
type State = {
  operatorList: OperatorInfo[],
  loading: boolean,
  openModalRegisterOperator: boolean,
};

class Operator extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state ={
      operatorList: [],
      loading: false,
      openModalRegisterOperator: false,
    };
    this.getOperatorList = this.getOperatorList.bind(this);
    this.openModalRegisterOperator = this.openModalRegisterOperator.bind(this);
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

  getOperatorList() {
    this.setState({ loading: true });
    axios.get('/operators').then((value) => {
      const { data: operatorList } = value;
      this.setState({ operatorList, loading: false });
    }).catch((reason) => {
      console.error(reason);
      this.setState({ loading: false });
    })
  }

  openModalRegisterOperator(open: boolean) {
    this.setState({ openModalRegisterOperator: open });
  }

  render() {
    const { role } = this.props;
    const { operatorList, loading, openModalRegisterOperator } = this.state;
    return (
      <Container>
        <Header as='h1'>Operators</Header>
        <Button icon labelPosition='left' onClick={this.getOperatorList}>
          <Icon name='refresh' />
          Refresh
        </Button>
        <Table celled compact selectable striped>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>Operator name</Table.HeaderCell>
              <Table.HeaderCell>Owner</Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {
              role === 'admin' ? (
                <Table.Row active>
                  <Table.Cell colSpan={2} textAlign='center'>
                    <Button icon labelPosition='left' onClick={() => this.openModalRegisterOperator(true)}>
                      <Icon name='plus' />
                      Register an operator
                    </Button>
                  </Table.Cell>
                </Table.Row>
              ) : <></>
            }
            {
              operatorList.map((operator) => {
                const { operatorName, owner } = operator;
                return (
                <Table.Row key={operatorName}>
                  <Table.Cell>{operatorName}</Table.Cell>
                  <Table.Cell>{owner}</Table.Cell>
                </Table.Row>
                );
              })
            }
          </Table.Body>
        </Table>
        <ModalRegisterOperator
          open={openModalRegisterOperator}
          closeAction={() => this.openModalRegisterOperator(false)}
        />
        <Dimmer active={loading}>
          <Loader />
        </Dimmer>
      </Container>
    );
  }
}

export default Operator;
