import type { JSONSchema7 } from "json-schema";
import { formatDialect, sqlite } from "sql-formatter";
import { entities } from "../entities";
import { escapeIdIfNeeded, getColumnDef } from "./shared";

/**
 * @deprecated, there is a more useful
 * version that works on the immediate data format
 */
export const getCreateTableQuery = (
  jsonSchema: JSONSchema7,
  options?: {
    name: string;
    format?: boolean;
  }
) => {
  const name = options?.name ?? jsonSchema.title;

  if (!name) throw new Error(`Name of table is required`);

  const query = `CREATE TABLE ${escapeIdIfNeeded(name)} (${Object.entries(
    jsonSchema.properties ?? {}
  )
    .map(([name, options]) => getColumnDef(name, options as any, jsonSchema))
    .join(", ")}) STRICT;`;

  if (options?.format) {
    return formatDialect(query, {
      dialect: sqlite,
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
