import axios from "axios";
import { Component } from "react";
import { Button, Container, Dimmer, Header, Icon, Loader, Table } from "semantic-ui-react";
import { config } from 'randevu-shared/dist/config';

type Props = {
  onUpdateAuthenticationResult: (authenticated: boolean, role: string | undefined) => void;
  role: string | undefined;
};
type State = {
  loading: boolean,
  openModalRegisterOperator: boolean,
};

class Operator extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state ={
      loading: false,
      openModalRegisterOperator: false,
    };
    this.openModalRegisterOperator = this.openModalRegisterOperator.bind(this);
    const { api } = config;
    axios.defaults.baseURL = `http://${api.host}:${api.port}`;
    axios.defaults.withCredentials = true;
  }

  componentDidMount() {
    const { onUpdateAuthenticationResult } = this.props;
    this.setState({ loading: true });
    axios.get('/authenticate').then(() => {
      axios.get('/features').then((value) => {
        // TODO: Fetch operator list
        this.setState({ loading: false });
      }).catch((reason) => {
        this.setState({ loading: false });
      });
    }).catch((reason) => {
      this.setState({ loading: false });
      onUpdateAuthenticationResult(false, undefined);
    });
  }

  openModalRegisterOperator(open: boolean) {
    this.setState({ openModalRegisterOperator: open });
  }

  render() {
    const { role } = this.props;
    const { loading } = this.state;
    return (
      <Container>
        <Header as='h1'>Operators</Header>
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
                    <Button icon labelPosition='left' size='tiny' onClick={() => this.openModalRegisterOperator(true)}>
                      <Icon name='plus' />
                      Register an operator
                    </Button>
                  </Table.Cell>
                </Table.Row>
              ) : <></>
            }
            {/* TODO: Operator list */}
          </Table.Body>
        </Table>
        {/* TODO: Modal to register an operator  */}
        <Dimmer active={loading}>
          <Loader />
        </Dimmer>
      </Container>
    );
  }
}

export default Operator;
