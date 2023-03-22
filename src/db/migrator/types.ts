import { z } from 'zod';

export const PrimativeColumnType = z.enum(['INTEGER', 'REAL', 'TEXT', 'BLOB']);
export type PrimativeColumnType = z.infer<typeof PrimativeColumnType>;

const RefColumnType = z.object({
  type: z.literal('ref'),
  table: z.string(),
});

const ArrayColumnType = z.object({
  type: z.literal('array'),
  item: PrimativeColumnType,
});
type ArrayColumnType = z.infer<typeof ArrayColumnType>;

const ColumnType = z.union([
  PrimativeColumnType,
  // z.object({
  //   type: z.literal('primative'),
  //   item: PrimativeColumnType,
  // }),
  RefColumnType,
  ArrayColumnType,
]);
type ColumnType = z.infer<typeof ColumnType>;

// export const SqliteColumnSchema = z.object({
//   cid: z.number().int().nullish(),
//   name: z.string(),
//   type: ColumnType,
//   notnull: z.union([z.literal(0), z.literal(1)]),
//   dflt_value: z.string().nullish(),
//   pk: z.number().int(),
// });

/** TODO: rename the variables like this */
export const SqliteColumnSchema = z.object({
  cid: z.number().int().nullish(),
  name: z.string(),
  type: ColumnType,
  notNull: z.boolean().default(false),
  defaultValue: z.string().nullish(),
  primaryKey: z.boolean().default(false),
});

export const SqliteTableSchema = z.object({
  // type: z.literal("table").optional(),
  name: z.string(),
  // tbl_name: z.string().optional(),
  columns: z.array(SqliteColumnSchema),
  // rootpage: number;
  // sql: string;
});

export type SqliteTableSchema = z.infer<typeof SqliteTableSchema>;

export type SqliteColumnSchema = z.infer<typeof SqliteColumnSchema>;

export const MigrationStepCreateTable = z.object({
  type: z.literal('create-table'),
  table: SqliteTableSchema,
  ifNotExists: z.boolean().optional(),
});
export type MigrationStepCreateTable = z.infer<typeof MigrationStepCreateTable>;

export const MigrationStep = z.discriminatedUnion('type', [
  MigrationStepCreateTable,
  z.object({
    type: z.literal('drop-table'),
    tableName: z.string(),
  }),
  z.object({
    type: z.literal('add-column'),
    tableName: z.string(),
    column: SqliteColumnSchema,
  }),
  z.object({
    type: z.literal('drop-column'),
    tableName: z.string(),
    columnName: z.string(),
  }),
]);

export type MigrationStep = z.infer<typeof MigrationStep>;
