import sqlQuery from './introspect-database.sql?raw';
import type {
	SqliteColumnSchema,
	SqliteColumnSchemaRaw,
	SqliteTableSchema,
} from './types';

export const introspectDatabase = async (
	queryDb: (sql: string) => any[] | Promise<any[]>,
) => {
	const items = (await queryDb(sqlQuery)) as SqliteTableSchema[];

	for (const item of items) {
		if (typeof item.columns === 'string') {
			const columns = JSON.parse(item.columns) as SqliteColumnSchemaRaw[];

			const cleaned: SqliteColumnSchema[] = [];

			for (const column of columns) {
				const { cid, name, type, notnull, dflt_value, pk } = column;

				cleaned.push({
					cid,
					name,
					type,
					notNull: notnull === 1,
					defaultValue: dflt_value,
					primaryKey: pk === 1,
				});
			}

			item.columns = cleaned;
		}
	}

	return items;
};
