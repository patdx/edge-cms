import { JSONSchema7 } from "json-schema";
import { DataSource, EntitySchema } from "typeorm/browser"; // TODO: reduce size here
import type { BetterSqlite3Driver } from "typeorm/driver/better-sqlite3/BetterSqlite3Driver";
// import sqlite from "better-sqlite3";

// export const DB = sqlite("data.db", {});

export const Category = new EntitySchema({
  name: "Category", // Will use table name `category` as default behaviour.
  tableName: "categories", // Optional: Provide `tableName` property to override the default behaviour for table name.
  columns: {
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
  columns: {
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
      createDate: true,
      // this would be more json friendly, but can't
      // get it to work at the moment:
      // https://www.golang.dk/articles/go-and-sqlite-in-the-cloud
      // default: "strftime('%Y-%m-%dT%H:%M:%fZ')",
    },
  },

  relations: {
    categories: {
      target: "Category",
      type: "many-to-many",
      joinTable: true,
      cascade: true,
    },
  },
});

export const ENTITIES = [Category, Post];

export const ENTITY_MAP = Object.fromEntries(
  ENTITIES.map((item) => [item.options.tableName, item])
);

export const DB = new DataSource({
  type: "better-sqlite3",
  database: "data.db",
  synchronize: true,
  logging: true,
  entities: [Category, Post],
  // subscribers: [],
  // migrations: [],
});

DB.initialize();

export const driver = DB.driver as BetterSqlite3Driver;

export const getSqlite = () =>
  driver.databaseConnection as import("better-sqlite3").Database;

export const convertTypeormSchemaToJsonSchema = (model: EntitySchema) => {
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
