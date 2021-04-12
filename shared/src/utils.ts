import { DocUser } from "./types";

export function isAdmin(user: DocUser | undefined) {
  return user && user.role === 'admin';
}
