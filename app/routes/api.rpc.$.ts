import type {
	ActionFunctionArgs,
	LoaderFunctionArgs,
} from '@remix-run/cloudflare';
import sql, { raw } from 'sql-template-tag';
import { defaultEntities } from '~/db/entities';
import { insertItem, updateItem } from '~/db/load-entity-data';
import { safeParseJsonSchemaTables } from '~/db/migrator/convert-schema';
import {
	diffSchema,
	generateManyMigrationStepsSql,
} from '~/db/migrator/diff-schema';
import { introspectDatabase } from '~/db/migrator/introspect-database';
import { isUserTable } from '~/db/migrator/shared';
import type { SchemaTable } from '~/db/migrator/system-tables';
import { getOrm } from '~/db/orm';

const hono = createHono()
	.post('/syncDatabaseSchema', async (c) => {
		const context = c.env;
		const orm = getOrm(c.env);
		const { DB } = orm;

		const getDatabaseTables = () =>
			introspectDatabase((sql) =>
				getOrm(context)
					.DB.prepare(sql)
					.all()
					.then((result) => result.results),
			);

		const databaseTables = await getDatabaseTables();

		const schemas = await orm.find<SchemaTable>('_schemas');

		const target = safeParseJsonSchemaTables(schemas);

		if (target.errors.length >= 1) {
			console.warn(target.errors.join('\n'));
		}

		const lines = generateManyMigrationStepsSql(
			diffSchema(
				databaseTables.filter((item) => isUserTable(item)),
				target.result,
			),
		);

		console.log(`running these lines: ${JSON.stringify(lines)}`);

		await DB.batch(lines.map((statement) => DB.prepare(statement)));

		return c.json({ ok: true });
	})
	.post('/deleteAllTables', async (c) => {
		console.log('deleteAllTables');
		const context = c.env;

		const DB = getOrm(context).DB;

		const tables = await DB.prepare(
			`SELECT name FROM sqlite_schema WHERE type = 'table' AND name NOT IN ('d1_kv', '_cf_KV')`,
		).all<{ name: string }>();

		console.log(tables.results);

		const lines =
			tables.results?.map((table) => `DROP TABLE ${table.name}`) ?? [];

		console.log(lines);

		await DB.batch(lines.map((line) => DB.prepare(line)));

		return c.json({ ok: true });
	})
	.post('/setUpDefaultSchemas', async (c) => {
		const context = c.env;

		await Promise.allSettled(
			Object.values(defaultEntities).map(async (entity) => {
				await insertItem(context, '_schemas', {
					json: JSON.stringify(entity), // , undefined, 2
				});
			}),
		);

		return c.json({ ok: true });
	})
	.post(
		'/deleteRow',
		zValidator(
			'json',
			z.object({
				entityName: z.string(),
				id: z.string().or(z.number()),
			}),
		),
		async (c) => {
			const context = c.env;

			const { entityName, id } = c.req.valid('json');

			const query = sql`DELETE FROM ${raw(entityName)} WHERE id = ${id}`;

			console.log(query.sql, query.values);

			await getOrm(context)
				.DB.prepare(query.sql)
				.bind(...query.values)
				.run();

			return c.json({
				entityName,
			});
		},
	)
	.post(
		'/insertItem',
		zValidator('json', z.object({ entityName: z.string(), data: z.any() })),
		async (c) => {
			const { entityName, data } = c.req.valid('json');

			const context = c.env;

			const { id } = await insertItem(context, entityName, data);

			return c.json({ id });
		},
	)
	.post(
		'/updateItem',
		zValidator(
			'json',
			z.object({ entityName: z.string(), data: z.any(), id: z.string() }),
		),
		async (c) => {
			const { entityName, id, data } = c.req.valid('json');

			const context = c.env;

			const { newId } = await updateItem({
				context,
				entityName,
				id,
				data: data,
			});

			return c.json({ newId });
		},
	);

export type AppType = typeof hono;

const app = createHono().route('/api/rpc', hono);

export function action({ request, context }: ActionFunctionArgs) {
	return app.request(request, {}, context);
}

export function loader({ request, context }: LoaderFunctionArgs) {
	return app.request(request, {}, context);
}
