export type Config = { 
  api: ApiConfig,
  db: DbConfig,
};

type ApiConfig = {
  host: string,
  port: number,
};

type DbConfig = {
  host: string,
  port: number,
  username: string,
  password: string,
  database: string,
};

export type User = {
  username: string;
  role?: string;
};
