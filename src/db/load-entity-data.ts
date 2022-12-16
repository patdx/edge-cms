import type { RequestContext } from "rakkasjs";
import { ENTITIES, ENTITY_MAP } from "src/db/entities";
import { getOrm } from "./orm";

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
  console.log("loadEntityData");
  const entity = ENTITY_MAP[entityName];

  if (!entity) return;

  const orm = getOrm(context);

  console.log("ENTITY", entity);

  // const jsonSchema = convertMikroOrmSchemaToJsonSchema(entity);

  // console.log(jsonSchema);

  // entity.meta.relations[0].m;

  return {
    entities: withEntities
      ? JSON.parse(
          JSON.stringify(
            await orm.find(entity, {
              // relations: ["categories"],
            })
          )
        )
      : [],
    entity: byId
      ? JSON.parse(
          JSON.stringify(
            await orm.findOne(entity, {
              id: byId,
            })
          )
        )
      : undefined,
    schema: JSON.parse(JSON.stringify(entity)), //test
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

  // return {};

  // const em = await getNewEm(context);

  // await em.nativeInsert(entity, data);
};

export const updateItem = async (
  context: RequestContext,
  entityName: string,
  data: Record<string, any>
) => {
  const entity = ENTITIES.find((entity) => entity.name === entityName);

  if (!entity) return;

  // const em = await getNewEm(context);

  // await em.nativeUpdate(entity, { id: data.id }, data);
};
