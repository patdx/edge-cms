import sqlQuery from './introspect-database.sql?raw';
import type { SqliteTableSchema } from './types';

export const introspectDatabase = async (
  queryDb: (sql: string) => any[] | Promise<any[]>
) => {
  const items = (await queryDb(sqlQuery)) as SqliteTableSchema[];

  for (const item of items) {
    if (typeof item.columns === 'string') {
      item.columns = JSON.parse(item.columns);
    }
  }

  return items;
};
