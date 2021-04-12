import { useEffect, useState } from "react";
import { Icon, Label } from "semantic-ui-react";
import { EnumItem } from "../types";

type Props = {
  enumList: EnumItem[];
  onChange?: (enumLisT: EnumItem[]) => void;
};

export default function EnumSelector({ enumList: enumListProp, onChange }: Props) {
  const [enumList, setEnumList] = useState<EnumItem[]>([]);

  useEffect(() => {
    setEnumList([...enumListProp]);
  }, [enumListProp]);

  function toggle(_id: string) {
    const index = enumList.findIndex((enumItem) => enumItem._id === _id);
    if (index === -1) {
      return;
    }
    const enumItem = enumList[index];
    enumItem.selected = !enumItem.selected;
    const enumListNew = [
      ...enumList.slice(0, index),
      enumItem,
      ...enumList.slice(index + 1),
    ];
    if (onChange) {
      onChange(enumListNew);
    } else {
      setEnumList(enumListNew);
    }
  }

  return (
    <>
      {
        enumList.map((enumItem) => {
          const { _id, name, selected } = enumItem;
          const color = selected ? 'green' : undefined;
          const icon = selected ? 'check square outline' : 'square outline';
          return (
            <Label as='a' key={_id} color={color}
              onClick={() => toggle(_id)}
            >
              <Icon name={icon} />
              {name}
            </Label>
          )
        })
      }
    </>
  )
}
