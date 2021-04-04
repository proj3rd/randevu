export function statusCode(response: any) {
  if (response && response.status) {
    return response.status;
  }
  return undefined;
}
