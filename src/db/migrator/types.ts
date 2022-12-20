// TODO: add validation for types for unit tests

export type SqliteTableSchema = {
  type: "table";
  name: string;
  tbl_name: string;
  // rootpage: number;
  // sql: string;
  columns: SqliteColumnSchema[];
};

export type SqliteCOlumnType = "INTEGER" | "REAL" | "TEXT" | "BLOB";

export type SqliteColumnSchema = {
  cid?: number;
  name: string;
  type: SqliteCOlumnType;
  notnull: 0 | 1;
  dflt_value: null | string;
  pk: 0 | 1;
};
