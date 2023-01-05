import type { JSONSchema6 } from 'json-schema';
import { formatDialect, sqlite } from 'sql-formatter';
import { convertJsonSchemaToDatabaseSchema } from './convert-schema';
import { generateMigrationStepCreateTable } from './diff-schema';

export const getCreateTableQuery = (
  jsonSchema: JSONSchema6,
  options?: {
    format?: boolean;
  }
) => {
  const name = jsonSchema.title;

  if (!name) throw new Error(`Name of table is required`);

  const databaseSchema = convertJsonSchemaToDatabaseSchema(jsonSchema);

  const query = generateMigrationStepCreateTable({
    type: 'create-table',
    table: databaseSchema,
  });

  if (options?.format) {
    return formatDialect(query, {
      dialect: sqlite,
      keywordCase: 'upper',
    });
  } else {
    return query;
  }
};
