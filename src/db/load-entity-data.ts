import type { RequestContext } from "rakkasjs";
import { entities } from "src/db/entities";
import { getEntity, getOrm } from "./orm";
import sql, { join, raw } from "sql-template-tag";

export const loadEntityData = async ({
  context,
  entityName,
  withEntities,
  byId,
}: {
  context: RequestContext;
  entityName: keyof typeof entities;
  withEntities?: boolean;
  byId?: string | number;
}) => {
  console.log("loadEntityData");
  const entity = entities[entityName];
  const orm = getOrm(context);

  return {
    entities: withEntities ? await orm.find(entityName) : [],
    entity: byId
      ? JSON.parse(JSON.stringify(await orm.findOne(entityName, byId)))
      : undefined,
    schema: JSON.parse(JSON.stringify(entity)),
  };
};

export const insertItem = async (
  context: RequestContext,
  entityName: string,
  data: any
) => {
  console.log(`insert item`, entityName, data);
  const entity = getEntity(entityName);

  const dataPairs = Object.entries(data);

  const query = sql`INSERT INTO ${raw(entityName)} (${raw(
    dataPairs.map((pair) => pair[0]).join(", ")
  )}) VALUES (${join(
    dataPairs.map((pair) => pair[1]),
    ", "
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
  // const entity = getEntity(entityName);

  const { id, ...remaining } = data;

  const query = sql`UPDATE ${raw(entityName)} SET ${join(
    Object.entries(remaining).map((item) => sql`${raw(item[0])} = ${item[1]}`),
    ", "
  )} WHERE id = ${id}`;

  console.log(query.sql, query.values);

  await getOrm(context)
    .DB.prepare(query.sql)
    .bind(...query.values)
    .run();
};
