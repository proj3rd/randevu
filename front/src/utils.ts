import { DocEnum } from "randevu-shared/dist/types";

export function markSelected(enumList: DocEnum[], enumListSelected: DocEnum[]) {
  const enumListNew = enumList.map((enumItem) => {
    const selected = !!enumListSelected.find((enumItemSelected) => {
      return enumItem._id === enumItemSelected._id;
    });
    return { ...enumItem, selected };
  });
  return enumListNew;
}
