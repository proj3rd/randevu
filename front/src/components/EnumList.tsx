import { DocEnum } from "randevu-shared/dist/types";
import { Label } from "semantic-ui-react";

type Props = {
  enumList: DocEnum[];
};

export default function EnumList({ enumList }: Props) {
  return (
    <>
      {
        enumList.map((enumItem) => {
          const { _id, name } = enumItem;
          return (
            <Label key={_id}>{name}</Label>
          )
        })
      }
    </>
  );
}
