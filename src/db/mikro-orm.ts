import { BetterSqliteDriver } from "@mikro-orm/better-sqlite";
import { EntitySchema, MikroORM } from "@mikro-orm/core"; // TODO: reduce size here
import { JSONSchema7 } from "json-schema";
// import sqlite from "better-sqlite3";

// export const DB = sqlite("data.db", {});

export const Category = new EntitySchema({
  name: "Category", // Will use table name `category` as default behaviour.
  tableName: "categories", // Optional: Provide `tableName` property to override the default behaviour for table name.
  properties: {
    id: {
      primary: true,
      type: "int",
      generated: true,
    },
    name: {
      type: "varchar",
    },
  },
});

export const Post = new EntitySchema({
  name: "Post", // Will use table name `post` as default behaviour.
  tableName: "posts", // Optional: Provide `tableName` property to override the default behaviour for table name.
  properties: {
    id: {
      primary: true,
      type: "int",
      generated: true,
    },
    title: {
      type: "varchar",
    },
    text: {
      type: "text",
    },
    createdAt: {
      type: "date",
      // createDate: true,
      // this would be more json friendly, but can't
      // get it to work at the moment:
      // https://www.golang.dk/articles/go-and-sqlite-in-the-cloud
      // default: "strftime('%Y-%m-%dT%H:%M:%fZ')",
    },
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

export const ORM = MikroORM.init<BetterSqliteDriver>({
  driver: BetterSqliteDriver,
  dbName: "data.db",
  // database: "data.db",
  // synchronize: true,
  // logging: true,
  entities: [Category, Post],
  // subscribers: [],
  // migrations: [],
});

export const getNewEm = () => ORM.then((orm) => orm.em.fork());

// DB.then(db => db.em.find(Category))

// export const driver = DB.driver as BetterSqlite3Driver;

// export const getSqlite = () =>
//   driver.databaseConnection as import("better-sqlite3").Database;

const DATABASE_TYPE_TO_JSON_SCHEMA_TYPE = new Map([
  ["int", "integer"],
  ["varchar", "string"],
  ["text", "string"],
]);

export const convertMikroOrmSchemaToJsonSchema = (model: EntitySchema) => {
  // https://github.com/AlfieriChou/typeorm-schema-to-json-schema/blob/master/index.js
  const columns = model.meta.properties || {};

  const result: JSONSchema7 = {
    type: "object",
    properties: {},
    required: [],
  };

  for (const [columnName, _columnInfo] of Object.entries(columns)) {
    const columnInfo = _columnInfo!;
    const jsonSchema = (columnInfo ?? {}) as any as JSONSchema7;

    const isNotRequired =
      columnInfo.nullable ||
      columnInfo.default ||
      columnInfo.defaultRaw ||
      columnInfo.autoincrement;

    if (!isNotRequired) {
      result.required!.push(columnName);
    }

    if (columnInfo.default || columnInfo.defaultRaw) {
      jsonSchema.readOnly = true;
    }

    if (DATABASE_TYPE_TO_JSON_SCHEMA_TYPE.has(jsonSchema.type)) {
      jsonSchema.type = DATABASE_TYPE_TO_JSON_SCHEMA_TYPE.get(jsonSchema.type)!;
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
