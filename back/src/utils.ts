export function validateString(input: any) {
  return typeof input === 'string' && input;
}

export function validateStringList(input: any) {
  return (input instanceof Array) && (input.every((item) => validateString(item)));
}
