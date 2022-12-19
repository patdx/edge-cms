import type { JSONSchema7 } from "json-schema";
import type { SqliteTableSchema } from "./types";

export const convertJsonSchemaToDatabaseSchema = (
  jsonSchema: JSONSchema7
): SqliteTableSchema => {
  return {
    type: "table",
    name: jsonSchema.title as string,
    tbl_name: jsonSchema.title as string,
    columns: [],
  };
};
