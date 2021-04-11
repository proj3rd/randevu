export type Config = { 
  api: ConfigApi,
  db: ConfigDb,
};

type ConfigApi = {
  host: string,
  port: number,
};

type ConfigDb = {
  host: string,
  port: number,
  username: string,
  password: string,
  database: string,
};

export type ApiVersion = {
  version: number;
  previousVersion: number | null;
};

export type DocEnum = {
  _key: string;
  name: string;
};

export type DocOperator = {
  _key: string;
  name: string;
  owner?: string;
};

export type User = {
  _id: string;
  username: string;
  role?: string;
};
