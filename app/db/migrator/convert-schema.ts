import type { JSONSchema6 } from 'json-schema';
import { getSqlType } from './shared';
import type { SchemaTable } from './system-tables';
import type { SqliteTableSchema } from './types';

export const convertJsonSchemaToDatabaseSchema = (
	jsonSchema: JSONSchema6,
): SqliteTableSchema => {
	const title = jsonSchema.title;

	if (!title)
		throw new Error(
			`json schema is missing a title ${JSON.stringify(jsonSchema)}`,
		);

	const rootTable: SqliteTableSchema = {
		name: title,
		columns: [],
	};

	for (const [key, prop] of Object.entries(jsonSchema.properties ?? {})) {
		if (typeof prop === 'object') {
			rootTable.columns.push({
				name: key,
				type: getSqlType(prop.type),
				notNull: jsonSchema.required?.includes(key),
				defaultValue: prop.default as any,
				primaryKey: key === 'id',
			});
		} else {
			console.warn(`property of type ${typeof prop} not supported`);
		}
	}

	return rootTable;
};

/**
 * for user input, use safeParseJsonSchemaTables instead
 * for better handling/recovery from invalid state
 */
export const convertManyJsonSchemasToDatabaseSchema = (
	jsonSchemas: JSONSchema6[],
) => jsonSchemas.map((schema) => convertJsonSchemaToDatabaseSchema(schema));

/**
 * like convertManyJsonSchemasToDatabaseSchema but can
 * gracefully ignore invalid rows to allow recovery
 */
export const safeParseJsonSchemaTables = (schemas: SchemaTable[]) => {
	const errors: string[] = [];
	const result: SqliteTableSchema[] = [];

	for (const schema of schemas) {
		try {
			const jsonSchema = JSON.parse(schema.json);
			const databaseSchema = convertJsonSchemaToDatabaseSchema(jsonSchema);
			result.push(databaseSchema);
		} catch (err) {
			errors.push(
				`Error on ${JSON.stringify(schema)}: ${(err as Error).message}`,
			);
		}
	}

	return { errors, result };
};
