import { formatDialect, sqlite } from 'sql-formatter';

export const formatSql = (
	query: string,
	options?: {
		throwOnError?: boolean;
	},
) => {
	try {
		return formatDialect(query, {
			dialect: sqlite,
			keywordCase: 'upper',
		});
	} catch (err) {
		if (options?.throwOnError) {
			throw err;
		}
		console.log('Error while formatting:');
		console.warn(err);
		return query;
	}
};
