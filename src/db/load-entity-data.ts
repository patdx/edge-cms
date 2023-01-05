import type { JSONSchema6 } from 'json-schema';
import type { RequestContext } from 'rakkasjs';
import sql, { join, raw } from 'sql-template-tag';
import { SchemaTable, systemTables } from './migrator/system-tables';
import { getOrm } from './orm';

export const loadEntityData = async ({
  context,
  entityName,
  withEntities,
  byId,
}: {
  context: RequestContext;
  entityName: string;
  withEntities?: boolean;
  byId?: string | number;
}) => {
  console.log('loadEntityData');

  const orm = getOrm(context);

  const schema = entityName.startsWith('_')
    ? JSON.parse(
        JSON.stringify(
          (systemTables as Record<string, JSONSchema6>)[entityName]
        )
      )
    : await orm.DB.prepare(
        `SELECT json FROM _schemas WHERE json_extract(json, '$.title') = ?`
      )
        .bind(entityName)
        .first('json')
        .then((res) => {
          return typeof res === 'string' ? JSON.parse(res) : undefined;
        });

  return {
    entities: withEntities ? await orm.find(entityName, schema) : [],
    entity: byId ? await orm.findOne(entityName, byId, schema) : undefined,
    schema,
  };
};

export const insertItem = async (
  context: RequestContext,
  entityName: string,
  data: any
) => {
  console.log(`insert item`, entityName, data);

  const dataPairs = Object.entries(data);

  const query = sql`INSERT INTO ${raw(entityName)} (${raw(
    dataPairs.map((pair) => pair[0]).join(', ')
  )}) VALUES (${join(
    dataPairs.map((pair) => pair[1]),
    ', '
  )})`;

  console.log(query.sql, query.values);

  await getOrm(context)
    .DB.prepare(query.sql)
    .bind(...query.values)
    .run();
};

export const updateItem = async (
  context: RequestContext,
  entityName: string,
  data: Record<string, any>
) => {
  const { id, ...remaining } = data;

  const query = sql`UPDATE ${raw(entityName)} SET ${join(
    Object.entries(remaining).map((item) => sql`${raw(item[0])} = ${item[1]}`),
    ', '
  )} WHERE id = ${id}`;

  console.log(query.sql, query.values);

  await getOrm(context)
    .DB.prepare(query.sql)
    .bind(...query.values)
    .run();
};
