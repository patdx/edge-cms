// import type { BetterSqliteDriver } from "@mikro-orm/better-sqlite";
import {
  ColumnType,
  EntityProperty,
  EntitySchema,
  MikroORM,
} from "@mikro-orm/core"; // TODO: reduce size here
import type { JSONSchema7, JSONSchema7TypeName } from "json-schema";
import type { RequestContext } from "rakkasjs";
import { CloudflareD1Driver } from "./d1-driver";
// import sqlite from "better-sqlite3";

// export const DB = sqlite("data.db", {});

export const Category = new EntitySchema({
  name: "Category", // Will use table name `category` as default behaviour.
  tableName: "categories", // Optional: Provide `tableName` property to override the default behaviour for table name.
  properties: {
    id: {
      primary: true,
      type: "integer",
      // generated: true,
    },
    name: {
      type: "varchar",
    },
  },
});

export const Post = new EntitySchema({
  name: "Post", // Will use table name `post` as default behaviour.
  tableName: "posts", // Optional: Provide `tableName` property to override the default behaviour for table name.
  // expression: "",
  properties: {
    id: {
      primary: true,
      type: "integer",
      // generated: true,
    },
    title: {
      type: "varchar",
    },
    text: {
      type: "text",
    },
    // createdAt: {
    //   type: "date",
    //   // createDate: true,
    //   // this would be more json friendly, but can't
    //   // get it to work at the moment:
    //   // https://www.golang.dk/articles/go-and-sqlite-in-the-cloud
    //   // default: "strftime('%Y-%m-%dT%H:%M:%fZ')",
    // },
    categories: {
      reference: "m:n",
      entity: "Category",
    },
  },

  // relations: {
  //   categories: {
  //     target: "Category",
  //     type: "many-to-many",
  //     joinTable: true,
  //     cascade: true,
  //   },
  // },
});

export const ENTITIES = [Category, Post];

export const ENTITY_MAP = Object.fromEntries(
  ENTITIES.map((item) => [item.name, item])
);

export const getOrm = (context: RequestContext) => {
  console.log(context);
  const CLOUDFLARE_DB = context.CLOUDFLARE_DB;

  const orm = MikroORM.init<CloudflareD1Driver>({
    driver: CloudflareD1Driver,
    driverOptions: {
      CLOUDFLARE_DB,
    },
    dbName: "data.db",
    entities: [Category, Post],
  });

  const getEntityManager = () => orm.then((orm) => orm.em.fork());

  return {
    orm,
    getEntityManager,
  };
};

export const getNewEm = (env: RequestContext) => getOrm(env).getEntityManager();

const DATABASE_TYPE_TO_JSON_SCHEMA_TYPE = new Map<
  ColumnType,
  JSONSchema7TypeName
>([
  ["int", "integer"],
  ["varchar", "string"],
  ["text", "string"],
]);

const getJsonSchemaForEntityProperty = (
  columnInfo?: EntityProperty
): JSONSchema7 => {
  if (!columnInfo) return { type: "null" };

  if (columnInfo.reference === "m:n") {
    const result: JSONSchema7 = {
      type: "array",
      items: {
        type: "object",
        properties: {
          id: getJsonSchemaForEntityProperty(
            columnInfo.targetMeta?.properties.id
          ),
        },
      },
    };
    return result;
  } else if (DATABASE_TYPE_TO_JSON_SCHEMA_TYPE.has(columnInfo.type as any)) {
    return {
      type: DATABASE_TYPE_TO_JSON_SCHEMA_TYPE.get(columnInfo.type as any)!,
    };
  } else if (columnInfo.type === "date") {
    return {
      type: "string",
      format: "date-time",
    };
  } else {
    // fallback
    return {
      type: columnInfo.type as any,
    };
  }
};

export const convertMikroOrmSchemaToJsonSchema = (model: EntitySchema) => {
  // https://github.com/AlfieriChou/typeorm-schema-to-json-schema/blob/master/index.js
  const columns = model.meta.properties || {};

  const result: JSONSchema7 = {
    type: "object",
    properties: {},
    required: [],
  };

  for (const [columnName, columnInfo] of Object.entries(columns)) {
    const jsonSchema: JSONSchema7 = {};

    const isNotRequired =
      columnInfo.nullable ||
      columnInfo.default ||
      columnInfo.defaultRaw ||
      columnInfo.autoincrement ||
      columnInfo.primary ||
      columnInfo.reference === "m:n";

    if (!isNotRequired) {
      result.required!.push(columnName);
    }

    if (columnInfo.default || columnInfo.defaultRaw) {
      jsonSchema.readOnly = true;
    }

    Object.assign(jsonSchema, getJsonSchemaForEntityProperty(columnInfo));

    result.properties![columnName] = jsonSchema;
  }

  // there may still be some non-plain stuff in the output
  return JSON.parse(JSON.stringify(result));
};
