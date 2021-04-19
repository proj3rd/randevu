import { Label } from "semantic-ui-react";
import { EnumItem } from "../types";

type Props = {
  enumList: EnumItem[];
};

export default function EnumList({ enumList }: Props) {
  return (
    <>
      {
        enumList.filter((enumItem) => enumItem.selected).map((enumItem) => {
          const { _id, name } = enumItem;
          return (
            <Label key={_id}>{name}</Label>
          )
        })
      }
    </>
  );
}
