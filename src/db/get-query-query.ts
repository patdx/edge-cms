import type { JSONSchema7, JSONSchema7TypeName } from "json-schema";
import { ENTITY_MAP } from "./entities";
import { format } from "sql-formatter";

const escapeIdIfNeeded = (text: string) => {
  // no-op for now
  return text;
};

const getSqlType = (
  typeName: JSONSchema7TypeName
): "INTEGER" | "REAL" | "TEXT" | "BLOB" => {
  if (typeName === "string") {
    return "TEXT";
  } else if (typeName === "integer") {
    return "INTEGER";
  } else if (typeName === "number") {
    return "REAL";
  } else {
    return typeName.toUpperCase() as any;
  }
};

const getColumnDef = (
  name: string,
  schema: JSONSchema7,
  parent?: JSONSchema7
) => {
  return [
    escapeIdIfNeeded(name),
    getSqlType(schema.type),
    ...(name === "id" ? ["PRIMARY KEY"] : []),
    ...(parent?.required?.includes(name) ? ["NOT NULL"] : []),
  ].join(" ");
};

export const getCreateTableQuery = (
  schema: JSONSchema7,
  options?: {
    name: string;
    format?: boolean;
  }
) => {
  const name = options?.name ?? schema.title;

  if (!name) throw new Error(`Name of table is required`);

  const query = `CREATE TABLE ${escapeIdIfNeeded(name)} (${Object.entries(
    schema.properties ?? {}
  )
    .map(([name, options]) => getColumnDef(name, options as any, schema))
    .join(", ")}) STRICT;`;

  if (options?.format) {
    return format(query, {
      language: "sqlite",
      keywordCase: "upper",
    });
  } else {
    return query;
  }
};

export const getAllCreateQueries = (options?: { format?: boolean }) => {
  const lines: string[] = [];

  for (const [name, entity] of Object.entries(ENTITY_MAP)) {
    const query = getCreateTableQuery(entity, {
      name,
      format: options?.format,
    });

    lines.push(query);
  }

  return lines;
};

console.log(getAllCreateQueries());
