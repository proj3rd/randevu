import { DocUser } from "randevu-shared/dist/types";
import { useParams } from "react-router-dom";
import { Header, Label } from "semantic-ui-react";

type Props = {
  user: DocUser | undefined;
};

export default function PackageInfoSub({ user }: Props) {
  const { seqVal } = useParams() as any;

  return (
    <>
      <Header as='h1'>
        <Header.Subheader>Packages</Header.Subheader>
        {/* {name} */}
      </Header>
      <Label>Operator</Label>
      <Header as='h2'>Deployment options</Header>
      <Header as='h2'>Products</Header>
      <Header as='h2'>Radio access technologies</Header>
      <Header as='h2'>RAN sharing</Header>
    </>
  );
}
