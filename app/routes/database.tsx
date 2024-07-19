import {
	unstable_defineLoader,
} from '@remix-run/cloudflare';
import { useLoaderData, useRevalidator } from '@remix-run/react';
import { useMutation, } from '@tanstack/react-query';
import { Show } from '~/components/show';
import {
	convertManyJsonSchemasToDatabaseSchema,
	safeParseJsonSchemaTables,
} from '~/db/migrator/convert-schema';
import {
	diffSchema,
	generateManyMigrationStepsSql,
} from '~/db/migrator/diff-schema';
import { introspectDatabase } from '~/db/migrator/introspect-database';
import { isUserTable } from '~/db/migrator/shared';
import { type SchemaTable, systemTables } from '~/db/migrator/system-tables';
import { getOrm } from '~/db/orm';
import { honoClient } from '~/utils/hono-client';

export const loader = unstable_defineLoader(async ({ context }) => {
	const orm = getOrm(context);

	const getDatabaseStatus = () =>
		introspectDatabase((sql) => {
			return getOrm(context)
				.DB.prepare(sql)
				.all()
				.then((result) => result.results);
		});

	const databaseStatus = await getDatabaseStatus();

	console.log('current db status', databaseStatus);

	const oldStatus = databaseStatus.filter((table) =>
		table.name?.startsWith('_'),
	); // system table starts with "_"

	const targetStatus = convertManyJsonSchemasToDatabaseSchema(
		Object.values(systemTables),
	);

	// sync system tables
	const systemTableMigrationSteps = diffSchema(oldStatus, targetStatus);

	const lines = generateManyMigrationStepsSql(systemTableMigrationSteps);

	console.log(`Initialization script: ${JSON.stringify(lines, undefined, 2)}`);

	if (lines.length >= 1) {
		// WARNING: be sure to check for lines first, otherwise this could cause a mysterious error
		await getOrm(context).DB.batch(
			lines.map((line) => getOrm(context).DB.prepare(line)),
		);
	}

	// finish sync

	const databaseTables = await getDatabaseStatus();

	const schemas = await orm.find<SchemaTable>('_schemas');

	console.log(schemas);

	const target = safeParseJsonSchemaTables(schemas);

	if (target.errors.length >= 1) {
		console.warn(target.errors.join('\n'));
	}

	const updateDump = generateManyMigrationStepsSql(
		diffSchema(
			databaseTables.filter((item) => isUserTable(item)),
			target.result,
		),
		{ format: true },
	);

	return { updateDump, schema: databaseTables };
});

const SchemaPage = () => {
	const result = useLoaderData<typeof loader>();

	console.log('data', result);

	const revalidator = useRevalidator();

	const syncDatabaseSchema = useMutation({
		mutationFn: () => {
			return honoClient.syncDatabaseSchema.$post();
		},
		onSettled() {
			revalidator.revalidate();
			// queryClient.invalidateQueries({
			// 	queryKey: ['overall-database-status'],
			// });
			// queryClient.invalidateQueries({
			// 	queryKey: ['available-entities'],
			// });
			// queryClient.invalidateQueries({
			// 	queryKey: ['database-counts'],
			// });
		},
	});

	// if (data.status === 'rejected') {
	// 	return <ErrorPage error={data.reason} resetErrorBoundary={() => {}} />;
	// }

	// const result = data.value;

	return (
		<div className="p-2 flex flex-col gap-2">
			<AdminTools />

			<div className="p-2 rounded border shadow">
				{/* TODO: make sure this automatically invalidates when updating _schemas table */}
				<h2>Pending schema changes:</h2>
				<Show
					when={result.updateDump.length >= 1}
					fallback={<p>No pending changes.</p>}
				>
					<button
						type="button"
						className="btn btn-warning mb-2"
						onClick={() => syncDatabaseSchema.mutate()}
					>
						Apply changes
					</button>
					<div className="">
						{result.updateDump.map((line) => (
							<pre
								key={line}
								className="whitespace-pre-wrap p-2 hover:bg-gray-200 active:bg-gray-200 transition"
							>
								{line}
							</pre>
						))}
					</div>
				</Show>
			</div>

			<div className="p-2 rounded border shadow">
				<h2>Current database schema</h2>
				<div className="flex flex-col gap-2">
					{Array.isArray(result.schema) && result.schema.length >= 1 ? (
						result.schema.map((item) => (
							<div key={item.name} className="p-2 rounded border shadow">
								<h4>{item.name}</h4>
								{item.columns.map((column) => {
									const { name, ...remaining } = column;
									return (
										<div key={column.name}>
											<strong>{name}</strong>{' '}
											<pre className="inline whitespace-pre-wrap break-all">
												{JSON.stringify(remaining)}
											</pre>
										</div>
									);
								})}
							</div>
						))
					) : (
						<pre>(No tables yet)</pre>
					)}
				</div>
			</div>
		</div>
	);
};

const AdminTools = () => {
	const revalidator = useRevalidator();

	const deleteAllTables = useMutation({
		mutationFn: () => honoClient.deleteAllTables.$post(),
		onSettled() {
			revalidator.revalidate();
			// queryClient.invalidateQueries([
			// 	'overall-database-status',
			// 	'available-entities',
			// 	'database-counts',
			// ]);
		},
	});

	const setUpDefaultSchemas = useMutation({
		mutationFn: () => honoClient.setUpDefaultSchemas.$post(),
		onSettled() {
			revalidator.revalidate();
			// queryClient.invalidateQueries([
			// 	'overall-database-status',
			// 	'available-entities',
			// 	'database-counts',
			// ]);
		},
	});

	return (
		<div className="p-2 rounded border shadow">
			<h2>Tools</h2>
			<div className="flex gap-2 flex-wrap">
				<button
					type="button"
					onClick={() => deleteAllTables.mutate()}
					className="btn btn-warning"
				>
					Delete all tables
				</button>
				<button
					type="button"
					onClick={() => setUpDefaultSchemas.mutate()}
					className="btn btn-warning"
				>
					Set up default schemas
				</button>
			</div>
		</div>
	);
};

export default SchemaPage;
