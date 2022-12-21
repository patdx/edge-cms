import type { JSONSchema6 } from "json-schema";
import { getSqlType } from "./shared";
import type { SqliteTableSchema } from "./types";

export const convertJsonSchemaToDatabaseSchema = (
  jsonSchema: JSONSchema6
): SqliteTableSchema => {
  const title = jsonSchema.title;

  if (!title) throw new Error("json schema is missing a title");

  const rootTable: SqliteTableSchema = {
    name: title,
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

export const convertManyJsonSchemasToDatabaseSchema = (
  jsonSchemas: JSONSchema6[]
) => jsonSchemas.map((schema) => convertJsonSchemaToDatabaseSchema(schema));
