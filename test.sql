WITH all_tables AS (
  SELECT
    name
  FROM
    sqlite_schema
  WHERE
    type = 'table'
)
SELECT
  at.name table_name,
  -- pti.*,
  json_group_array(
    json_object(
      'cid',
      pti.cid,
      'name',
      pti.name,
      'type',
      pti.type,
      'notnull',
      pti.notnull,
      'dflt_value',
      pti.dflt_value,
      'pk',
      pti.pk
    )
  ) as cols
FROM
  all_tables at
  INNER JOIN pragma_table_info(at.name) pti -- ORDER BY
  --   table_name
GROUP BY
  at.name;