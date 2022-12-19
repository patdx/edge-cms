import type { JSONSchema7, JSONSchema7TypeName } from "json-schema";
import { entities } from "../entities";
import { format } from "sql-formatter";
import { escapeIdIfNeeded, getColumnDef } from "./shared";

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

  for (const [name, entity] of Object.entries(entities)) {
    const query = getCreateTableQuery(entity, {
      name,
      format: options?.format,
    });

    lines.push(query);
  }

  return lines;
};
