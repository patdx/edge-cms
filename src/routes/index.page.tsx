import { Link, Page, useServerSideQuery } from 'rakkasjs';
import { SYSTEM_TABLES } from 'src/db/migrator/shared';
import { getOrm } from 'src/db/orm';

const HomePage: Page = function HomePage() {
  const query = useServerSideQuery(
    async (context) => {
      const orm = getOrm(context);

      const tableNames = await orm.DB.prepare(
        `
SELECT
  name
FROM
  sqlite_schema
WHERE
  type = 'table'
  AND name NOT IN (${SYSTEM_TABLES.map((name) => `'${name}'`).join(', ')})
ORDER BY name
      `
      ).all<{
        name: string;
      }>();

      const counts = await orm.DB.batch<{ name: string; count: number }>(
        tableNames.results?.map((table) =>
          orm.DB.prepare(
            `SELECT ? as name, count(*) as count FROM ${table.name}`
          ).bind(table.name)
        ) ?? []
      );

      return counts;
    },
    {
      key: 'database-counts',
    }
  );

  return (
    <main className="p-2">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {query.data.map((item) => {
          const row = item.results?.[0];
          const { name, count } = row ?? {};
          return (
            <Link key={name} className="stats shadow" href={`/${name}`}>
              <div className="stat">
                <div className="stat-title">{name}</div>
                <div className="stat-value">{count}</div>
              </div>
            </Link>
          );
        })}
      </div>
    </main>
  );
};

export default HomePage;
