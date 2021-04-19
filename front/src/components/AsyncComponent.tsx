import { Dimmer, Loader } from "semantic-ui-react";

type Props = {
  render: (/* TODO */) => React.ReactNode;
  waiting: boolean;
};

export default function AsyncComponent({ render, waiting }: Props) {
  return (
    <Dimmer.Dimmable>
      { render() }
      <Dimmer active={waiting}>
        <Loader />
      </Dimmer>
    </Dimmer.Dimmable>
  )
}
