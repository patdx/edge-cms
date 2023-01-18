import { Static, Type } from '@sinclair/typebox';

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
      json: Type.String({ 'ui:widget': 'json' }),
    },
    {
      title: '_schemas',
    }
  ),
};

export type SchemaTable = Static<(typeof systemTables)['_schemas']>;
