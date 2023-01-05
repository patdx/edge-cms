import { Type } from '@sinclair/typebox';
import Database from 'better-sqlite3';
import { describe, expect, test } from 'vitest';
import { defaultEntities } from '../entities';
import {
  convertJsonSchemaToDatabaseSchema,
  convertManyJsonSchemasToDatabaseSchema,
} from './convert-schema';
import { getCreateTableQuery } from './create-table';
import { diffSchema, generateMigrationStepSql } from './diff-schema';
import { introspectDatabase } from './introspect-database';
import { SqliteTableSchema } from './types';

// How migration works
// 1. convert desired schema to entity format
// 2. convert actual database to entity format
// 3. diff these and figure out the SQL steps to
/// solve this mystery

describe('migrator', () => {
  test('convert json schema to entity format', () => {
    const dbSchema = convertJsonSchemaToDatabaseSchema(
      defaultEntities.categories
    );

    const errors = SqliteTableSchema.safeParse(dbSchema);

    expect(errors.success === true);

    expect(dbSchema).toMatchInlineSnapshot(`
      {
        "columns": [
          {
            "dflt_value": undefined,
            "name": "id",
            "notnull": 0,
            "pk": 1,
            "type": "INTEGER",
          },
          {
            "dflt_value": undefined,
            "name": "name",
            "notnull": 1,
            "pk": 0,
            "type": "TEXT",
          },
        ],
        "name": "categories",
        "type": "table",
      }
    `);
  });

  test('introspect format from datbase', async () => {
    const db = new Database(':memory:');
    try {
      const migration = getCreateTableQuery(defaultEntities.categories);

      db.exec(migration);

      const dbSchema = await introspectDatabase((sql) => db.prepare(sql).all());

      for (const table of dbSchema) {
        const parseResult = SqliteTableSchema.safeParse(table);

        expect(parseResult.success === true);
      }
    } finally {
      db.close();
    }
  });
});

describe('can create table', () => {
  test('post table', () => {
    expect(getCreateTableQuery(defaultEntities.posts)).toMatchInlineSnapshot(
      '"CREATE TABLE posts (id INTEGER PRIMARY KEY, title TEXT NOT NULL, text TEXT NOT NULL) STRICT;"'
    );
  });

  // it("match formatting")
});

const Categories1 = Type.Object(
  {
    id: Type.Optional(Type.Integer()),
    name: Type.String(),
  },
  {
    title: 'categories',
  }
);

const Categories2 = Type.Object(
  {
    id: Type.Optional(Type.Integer()),
    type: Type.String(),
  },
  {
    title: 'categories',
  }
);

describe('diff tables', () => {
  test('diff empty to empty', () => {
    expect(diffSchema([], [])).toEqual([]);
  });

  test('diff for creating one table', () => {
    const steps = diffSchema(
      [],
      [convertJsonSchemaToDatabaseSchema(defaultEntities.categories)]
    );

    expect(steps).toMatchInlineSnapshot(`
      [
        {
          "table": {
            "columns": [
              {
                "dflt_value": undefined,
                "name": "id",
                "notnull": 0,
                "pk": 1,
                "type": "INTEGER",
              },
              {
                "dflt_value": undefined,
                "name": "name",
                "notnull": 1,
                "pk": 0,
                "type": "TEXT",
              },
            ],
            "name": "categories",
            "type": "table",
          },
          "type": "create-table",
        },
      ]
    `);

    expect(steps.map((step) => generateMigrationStepSql(step)))
      .toMatchInlineSnapshot(`
      [
        "CREATE TABLE categories (id INTEGER PRIMARY KEY, name TEXT NOT NULL) STRICT;",
      ]
    `);
  });

  test('diff for removing one table', () => {
    const steps = diffSchema(
      [convertJsonSchemaToDatabaseSchema(defaultEntities.categories)],
      []
    );

    expect(steps).toMatchInlineSnapshot(`
      [
        {
          "tableName": "categories",
          "type": "drop-table",
        },
      ]
    `);

    expect(steps.map((step) => generateMigrationStepSql(step)))
      .toMatchInlineSnapshot(`
      [
        "DROP TABLE categories",
      ]
    `);
  });

  test('diff for adding one column', () => {
    const current = convertManyJsonSchemasToDatabaseSchema([Categories1]);
    const target = convertManyJsonSchemasToDatabaseSchema([Categories2]);

    console.log(
      JSON.stringify(
        {
          current,
          target,
        },
        undefined,
        2
      )
    );

    const steps = diffSchema(current, target);

    expect(steps).toMatchInlineSnapshot(`
      [
        {
          "column": {
            "dflt_value": undefined,
            "name": "type",
            "notnull": 1,
            "pk": 0,
            "type": "TEXT",
          },
          "tableName": "categories",
          "type": "add-column",
        },
        {
          "columnName": "name",
          "tableName": "categories",
          "type": "drop-column",
        },
      ]
    `);

    expect(steps.map((step) => generateMigrationStepSql(step)))
      .toMatchInlineSnapshot(`
        [
          "ALTER TABLE categories ADD COLUMN type TEXT NOT NULL",
          "ALTER TABLE categories DROP COLUMN name",
        ]
      `);
  });

  test('will handle system tables', () => {
    const result = diffSchema(
      [],
      [
        {
          name: '_migrations',
          columns: [
            { name: 'id', type: 'TEXT', notnull: 1, pk: 1 },
            { name: 'sql', type: 'TEXT', notnull: 1, pk: 0 },
          ],
        },
        {
          name: '_migrations',
          columns: [
            { name: 'id', type: 'TEXT', notnull: 1, pk: 1 },
            { name: 'json', type: 'TEXT', notnull: 1, pk: 0 },
          ],
        },
      ]
    );
  });
});
