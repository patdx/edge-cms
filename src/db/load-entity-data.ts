import type { JSONSchema6 } from 'json-schema';
import type { RequestContext } from 'rakkasjs';
import sql, { join, raw } from 'sql-template-tag';
import { getSystemTable, isSystemTable } from './migrator/system-tables';
import { getOrm } from './orm';

export const loadEntityData = async ({
	context,
	entityName,
	withEntities,
	byId,
}: {
	context: RequestContext;
	entityName: string;
	withEntities?: boolean;
	byId?: string | number;
}) => {
	console.log(`loadEntityData for ${entityName} byId=${byId}`);

	const orm = getOrm(context);

	const { schema, schemaId } = isSystemTable(entityName)
		? {
				schemaId: entityName,
				schema: getSystemTable(entityName),
			}
		: await orm.DB.prepare(
				`SELECT id, json FROM _schemas WHERE json_extract(json, '$.title') = ?`,
			)
				.bind(entityName)
				.all<{ id: string | number; json: string | null }>()
				.then((res) => {
					const { id, json } = res.results?.[0] ?? {};

					return {
						schemaId: id,
						schema: typeof json === 'string' ? JSON.parse(json) : undefined,
					};
				});

	// viewing the metadata of the _schemas
	// is a special case. for completeness, trying
	// to provide the schema of _schemas and _migrations
	// even though they are hardcorded into the application
	// and MUST be hardcoded

	const { readOnly, entity } = byId
		? entityName === '_schemas' &&
			typeof byId === 'string' &&
			isSystemTable(byId)
			? {
					readOnly: true,
					entity: {
						id: byId,
						json: getSystemTable(byId),
					},
				}
			: { readOnly: false, entity: await orm.findOne(entityName, byId, schema) }
		: { readOnly: true, entity: undefined };

	return {
		/**
		 * if true, this entity cannot be edited
		 * generally only true for metadata of system tables
		 * inside of _schemas
		 */
		readOnly,
		entities: withEntities ? await orm.find(entityName, schema) : [],
		entity,
		schema: schema as JSONSchema6 | undefined,
		schemaId,
	};
};

export const insertItem = async (
	context: RequestContext,
	entityName: string,
	data: any,
) => {
	console.log(`insert item`, entityName, data);

	const dataPairs = Object.entries(data);

	const query = sql`INSERT INTO ${raw(entityName)} (${raw(
		dataPairs.map((pair) => pair[0]).join(', '),
	)}) VALUES (${join(
		dataPairs.map((pair) => pair[1]),
		', ',
	)}) RETURNING id`;

	console.log(query.sql, query.values);

	const result = await getOrm(context)
		.DB.prepare(query.sql)
		.bind(...query.values)
		.first<{ id: string | number }>();

	return result;
};

export const updateItem = async ({
	context,
	entityName,
	id,
	data,
}: {
	context: RequestContext;
	entityName: string;
	// NOTE: id must be passed separately to account for the case
	// where id is changed inside the update
	id: string | number;
	data: Record<string, any>;
}) => {
	// const { id, ...remaining } = data;
	const remaining = data;

	const query = sql`UPDATE ${raw(entityName)} SET ${join(
		Object.entries(remaining).map((item) => sql`${raw(item[0])} = ${item[1]}`),
		', ',
	)} WHERE id = ${id} RETURNING id`;

	console.log(query.sql, query.values);

	const result = await getOrm(context)
		.DB.prepare(query.sql)
		.bind(...query.values)
		.first<{ id: string | number }>();

	const newId = result?.id;

	return {
		newId,
	};
};
