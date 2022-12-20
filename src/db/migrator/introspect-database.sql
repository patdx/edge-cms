WITH all_tables AS (
  SELECT
    name
  FROM
    sqlite_master
  WHERE
    type = 'table'
)
SELECT
  at.name table_name,
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
ORDER BY
  table_name