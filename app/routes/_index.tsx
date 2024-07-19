import { json, unstable_defineLoader } from '@remix-run/cloudflare';
import { Link, useLoaderData } from '@remix-run/react';
import { SYSTEM_TABLES } from '~/db/migrator/shared';
import { getOrm } from '~/db/orm';
import { wrapServerQuery } from '~/utils/wrap-server-query';
import { For } from '~/components/for';
import { ErrorPage } from '~/components/error-page';

export const loader = unstable_defineLoader(async ({ context }) => {
	const result = await wrapServerQuery(async () => {
		{
			const orm = getOrm(context);

			let tableNames;

			try {
				tableNames = await orm.DB.prepare(
					`
	SELECT
	name
	FROM
	sqlite_schema
	WHERE
	type = 'table'
	AND name NOT IN (${SYSTEM_TABLES.map((name) => `'${name}'`).join(', ')})
	ORDER BY name
			`,
				).all<{
					name: string;
				}>();
			} catch (error) {
				console.log('failed to get table names', error);
			}

			let counts;

			if (tableNames?.results.length) {
				try {
					console.log('getting counts', tableNames.results);
					counts = await orm.DB.batch<{ name: string; count: number }>(
						tableNames.results?.map((table) =>
							orm.DB.prepare(
								`SELECT ? as name, count(*) as count FROM ${table.name}`,
							).bind(table.name),
						) ?? [],
					);
				} catch (error) {
					console.log('failed to get counts', error);
				}
			}

			return counts;
		}
	});

	return json(result);
});

export default function Index() {
	const data = useLoaderData<typeof loader>();

	if (data.status === 'rejected') {
		return <ErrorPage error={data.reason} resetErrorBoundary={() => {}} />;
	}

	const items = data.value;

	return (
		<main className="p-2">
			<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
				<For
					each={items}
					as={(item) => {
						const row = item.results?.[0];
						const { name, count } = row ?? {};
						return (
							<Link key={name} className="stats shadow" to={`/${name}`}>
								<div className="stat">
									<div className="stat-title">{name}</div>
									<div className="stat-value">{count}</div>
								</div>
							</Link>
						);
					}}
					fallback={<div className="p-4">No tables yet.</div>}
				/>
			</div>
		</main>
	);
}
