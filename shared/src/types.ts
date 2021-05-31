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
  _id: string;
  name: string;
};

export type DocOperator = {
  _id: string;
  name: string;
  owner?: string;
};

export type DocPackage = {
  _id: string;
  name: string;
  main?: string;
  operator?: string;
  previous?: string;
  owner?: string;
  deploymentOptions?: string[];
  product?: string[];
  radioAccessTechnologies?: string[];
  ranSharing?: string[]
}

export type DocUser = {
  _id: string;
  username: string;
  role?: string;
};
