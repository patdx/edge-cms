import type { RequestContext } from "rakkasjs";
import {
  convertMikroOrmSchemaToJsonSchema,
  ENTITIES,
  getNewEm,
} from "src/db/mikro-orm";

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
  const entity = ENTITIES.find((entity) => entity.name === entityName);

  if (!entity) return;

  const em = await getNewEm(context);

  const jsonSchema = convertMikroOrmSchemaToJsonSchema(entity);

  // console.log(jsonSchema);

  // entity.meta.relations[0].m;

  return {
    entities: withEntities
      ? JSON.parse(
          JSON.stringify(
            await em.find(entity, {
              // relations: ["categories"],
            })
          )
        )
      : [],
    entity: byId
      ? JSON.parse(
          JSON.stringify(
            await em.findOne(entity, {
              id: byId,
            })
          )
        )
      : undefined,
    schema: JSON.parse(JSON.stringify(jsonSchema)), //test
    // dbSchema: JSON.parse(JSON.stringify(entity.meta)),
  };
};

export const insertItem = async (
  context: RequestContext,
  entityName: string,
  data: any
) => {
  console.log(`insert item`, entityName, data);
  const entity = ENTITIES.find((entity) => entity.name === entityName);

  if (!entity) return;

  const em = await getNewEm(context);

  await em.nativeInsert(entity, data);
};

export const updateItem = async (
  context: RequestContext,
  entityName: string,
  data: Record<string, any>
) => {
  const entity = ENTITIES.find((entity) => entity.name === entityName);

  if (!entity) return;

  const em = await getNewEm(context);

  await em.nativeUpdate(entity, { id: data.id }, data);
};
