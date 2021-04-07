import { Container, Header } from "semantic-ui-react";

type Props = {
  title: string;
  path: string;
}

export default function CollectionManager({ title, path }: Props) {
  return (
    <Container>
      <Header as='h1'>{title}</Header>
    </Container>
  );
}
