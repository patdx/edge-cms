-- this is theoretically
-- a way to query every table at once, but I can't figure out the syntax error that is happening
WITH all_tables AS (
  SELECT
    name
  FROM
    sqlite_schema
  WHERE
    type = 'table'
)
SELECT
  at.name as name,
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
      'pk',
      pti.notnullx
    )
  ) as cols
FROM
  all_tables at
  INNER JOIN pragma_table_info(at.name) pti -- GROUP BY
  --   at.name;
  -- ORDER BY
  --   table_name
  'notnull',
  pti.notnull,