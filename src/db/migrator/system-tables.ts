import { Static, Type } from '@sinclair/typebox';
import type { JSONSchema6 } from 'json-schema';

export const systemTables = {
  _migrations: Type.Object(
    {
      id: Type.Optional(Type.Integer()),
      sql: Type.String(),
    },
    {
      title: '_migrations',
    }
  ),
  _schemas: Type.Object(
    {
      id: Type.Optional(Type.Integer()),
      json: Type.String({
        'ui:widget': 'json',
        // 'ui:widget': 'textarea',
      }),
    },
    {
      title: '_schemas',
    }
  ),
};

export type SchemaTable = Static<(typeof systemTables)['_schemas']>;

export const isSystemTable = (name: string) => name.startsWith('_');

export const getSystemTable = (name: string) => {
  return JSON.parse(
    JSON.stringify((systemTables as Record<string, JSONSchema6>)[name])
  );
};
