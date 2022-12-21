import type { JSONSchema6, JSONSchema6TypeName } from "json-schema";
import type { SqliteColumnType } from "./types";

export const escapeIdIfNeeded = (text: string) => {
  // no-op for now
  return text;
};

export const getSqlType = (
  typeName?: JSONSchema6TypeName | JSONSchema6TypeName[]
): SqliteColumnType => {
  if (typeName === "string") {
    return "TEXT";
  } else if (typeName === "integer") {
    return "INTEGER";
  } else if (typeName === "number") {
    return "REAL";
  } else {
    return (typeName as any).toUpperCase() as any;
  }
};

export const getColumnDef = (
  name: string,
  schema: JSONSchema6,
  parent?: JSONSchema6
) => {
  return [
    escapeIdIfNeeded(name),
    getSqlType(schema.type),
    ...(name === "id" ? ["PRIMARY KEY"] : []),
    ...(parent?.required?.includes(name) ? ["NOT NULL"] : []),
  ].join(" ");
};
