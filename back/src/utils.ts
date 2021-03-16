/**
 * Merge item of `objList2` into item of `objList1` with `key2` and `key1`, respectively.
 * It mutates `objList1` and `objList2`.
 */
export function mergeObjectList(objList1: any[], objList2: any[], key1: string, key2: string = key1) {
  for (let i = 0; i < objList1.length; i += 1) {
    const obj1 = objList1[i];
    const j = objList2.findIndex((obj2) => obj2[key2] === obj1[key1]);
    if (j === -1) {
      continue;
    }
    const obj2 = objList2[j];
    delete obj2[key2];
    Object.assign(obj1, obj2);
  }
}

export function validateString(input: any) {
  return typeof input === 'string' && input;
}

export function validateStringList(input: any) {
  return (input instanceof Array) && (input.every((item) => validateString(item)));
}
