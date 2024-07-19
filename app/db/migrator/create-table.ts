import type { JSONSchema6 } from 'json-schema';
import { formatSql } from '~/utils/format-sqlite';
import { convertJsonSchemaToDatabaseSchema } from './convert-schema';
import { generateMigrationStepCreateTable } from './diff-schema';

// NOTE: not being used yet

export const getCreateTableQuery = (
	jsonSchema: JSONSchema6,
	options?: {
		format?: boolean;
	},
) => {
	const name = jsonSchema.title;

	if (!name) throw new Error('Name of table is required');

	const databaseSchema = convertJsonSchemaToDatabaseSchema(jsonSchema);

	const query = generateMigrationStepCreateTable({
		type: 'create-table',
		table: databaseSchema,
	});

	if (options?.format) {
		return formatSql(query);
	} else {
		return query;
	}
};
