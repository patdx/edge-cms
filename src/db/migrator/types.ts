import { z } from "zod";

export const SqliteColumnSchema = z.object({
  cid: z.number().int().nullish(),
  name: z.string(),
  type: z.string(), // SqliteColumnType
  notnull: z.union([z.literal(0), z.literal(1)]),
  dflt_value: z.string().nullish(),
  pk: z.number().int(),
});

export const SqliteTableSchema = z.object({
  type: z.literal("table").optional(),
  name: z.string().optional(),
  tbl_name: z.string().optional(),
  columns: z.array(SqliteColumnSchema),
  // rootpage: number;
  // sql: string;
});

export type SqliteTableSchema = z.infer<typeof SqliteTableSchema>;

export type SqliteColumnType = "INTEGER" | "REAL" | "TEXT" | "BLOB";

export type SqliteColumnSchema = z.infer<typeof SqliteColumnSchema>;

export const MigrationStep = z.union([
  z.object({
    type: z.literal("create-table"),
    table: SqliteTableSchema,
  }),
  z.object({
    type: z.literal("drop-table"),
    tableName: z.string(),
  }),
  z.object({
    type: z.literal("add-column"),
    tableName: z.string(),
    column: SqliteColumnSchema,
  }),
  z.object({
    type: z.literal("drop-column"),
    tableName: z.string(),
    columnName: z.string(),
  }),
]);

export type MigrationStep = z.infer<typeof MigrationStep>;
