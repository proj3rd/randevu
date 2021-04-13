import { DocUser } from "./types";

export function isAdmin(user: DocUser | undefined) {
  return user && user.role === 'admin';
}

export function seqValOf(_id: string) {
  const index = _id.lastIndexOf('/');
  return _id.substring(index + 1);
}
