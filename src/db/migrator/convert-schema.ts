import type { JSONSchema7 } from "json-schema";
import { getSqlType } from "./shared";
import type { SqliteTableSchema } from "./types";

export const convertJsonSchemaToDatabaseSchema = (
  jsonSchema: JSONSchema7,
  options?: { tableName?: string }
): SqliteTableSchema => {
  const title = options?.tableName ?? jsonSchema.title;

  const rootTable: SqliteTableSchema = {
    type: "table",
    name: title,
    tbl_name: title,
    columns: [],
  };

  for (const [key, prop] of Object.entries(jsonSchema.properties ?? {})) {
    if (typeof prop === "object") {
      rootTable.columns.push({
        name: key,
        type: getSqlType(prop.type),
        notnull: jsonSchema.required?.includes(key) ? 1 : 0,
        dflt_value: prop.default as any,
        pk: key === "id" ? 1 : 0,
      });
    } else {
      console.warn(`property of type ${typeof prop} not supported`);
    }
  }

  return rootTable;
};
