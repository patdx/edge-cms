import { DB, ENTITIES } from "src/db";
import type { EntitySchema } from "typeorm";
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
  const entity = ENTITIES.find(
    (entity) => entity.options.tableName === entityName
  );

  if (!entity) return;

  return {
    entities: withEntities
      ? await DB.getRepository(entity).find({
          // relations: ["categories"],
        })
      : [],
    entity: byId
      ? await DB.getRepository(entity).findOneBy({
          id: byId,
        })
      : undefined,
    schema: convertTypeormSchemaToJsonSchema(entity), //test
    typeOrmSchema: entity.options,
  };
};

export const insertItem = async (entityName: string, data: any) => {
  const entity = ENTITIES.find(
    (entity) => entity.options.tableName === entityName
  );

  if (!entity) return;

  await DB.getRepository(entity).insert(data);
};

export const updateItem = async (entityName: string, data: any) => {
  const entity = ENTITIES.find(
    (entity) => entity.options.tableName === entityName
  );

  if (!entity) return;

  await DB.getRepository(entity).update(data);
};

const convertSqlTypeToJsonSchema = new Map([
  ["int", "integer"],
  ["varchar", "string"],
  ["text", "string"],
]);

const convertTypeormSchemaToJsonSchema = (model: EntitySchema) => {
  // https://github.com/AlfieriChou/typeorm-schema-to-json-schema/blob/master/index.js
  const columns = model.options.columns || {};

  const result: JSONSchema7 = {
    type: "object",
    properties: {},
    required: [],
  };

  for (const [columnName, _columnInfo] of Object.entries(columns)) {
    const columnInfo = _columnInfo!;
    const jsonSchema = (columnInfo ?? {}) as any as JSONSchema7;

    const isNotRequired =
      columnInfo.nullable || columnInfo.generated || columnInfo.createDate;

    if (!isNotRequired) {
      result.required!.push(columnName);
    }

    if (columnInfo.generated || columnInfo.createDate) {
      jsonSchema.readOnly = true;
    }

    if (convertSqlTypeToJsonSchema.has(jsonSchema.type)) {
      jsonSchema.type = convertSqlTypeToJsonSchema.get(jsonSchema.type)!;
    } else if (jsonSchema.type === "date") {
      jsonSchema.type = "string";
      jsonSchema.format = "date-time";
    }
    // if (type === "in")

    result.properties![columnName] = jsonSchema;
  }

  // console.log(result);

  // there may still be some non-plain stuff in the output
  return JSON.parse(JSON.stringify(result));
};
