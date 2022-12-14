import {
  convertMikroOrmSchemaToJsonSchema,
  ORM,
  ENTITIES,
  getNewEm,
} from "src/db/mikro-orm";
import type { EntitySchema } from "@mikro-orm/core";
import type { JSONSchema7 } from "json-schema";

export const loadEntityData = async ({
  entityName,
  withEntities,
  byId,
}: {
  entityName: string;
  withEntities?: boolean;
  byId?: string | number;
}) => {
  const entity = ENTITIES.find((entity) => entity.name === entityName);

  if (!entity) return;

  const em = await getNewEm();

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
    schema: JSON.parse(
      JSON.stringify(convertMikroOrmSchemaToJsonSchema(entity))
    ), //test
    // typeOrmSchema: JSON.parse(JSON.stringify(entity.meta)),
  };
};

export const insertItem = async (entityName: string, data: any) => {
  const entity = ENTITIES.find((entity) => entity.name === entityName);

  if (!entity) return;

  const em = await getNewEm();

  await em.create(entity, data);
};

export const updateItem = async (entityName: string, data: any) => {
  const entity = ENTITIES.find((entity) => entity.name === entityName);

  if (!entity) return;

  const em = await getNewEm();

  await em.upsert(entity, data);
};
