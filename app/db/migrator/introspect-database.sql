WITH all_tables AS (
	SELECT
		name
	FROM
		sqlite_schema
	WHERE
		type = 'table'
		AND name NOT IN ('d1_kv', '_cf_KV') -- ignore system tables
)
SELECT
	at.name name,
	json_group_array(
		json_object(
			'cid',
			pti.cid,
			'name',
			pti.name,
			'type',
			pti.type,
			'dflt_value',
			pti.dflt_value,
			'notnull',
			pti."notnull",
			'pk',
			pti.pk
		)
	) as columns
FROM
	all_tables at
	INNER JOIN pragma_table_info(at.name) pti
GROUP BY
	at.name
ORDER BY
	name;