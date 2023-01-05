import { Type } from '@sinclair/typebox';

const defineEntities = <T extends Record<string, unknown>>(entities: T) =>
  entities;

export const defaultEntities = defineEntities({
  categories: Type.Object(
    {
      id: Type.Optional(Type.Integer()),
      name: Type.String(),
    },
    {
      title: 'categories',
    }
  ),
  posts: Type.Object(
    {
      id: Type.Optional(Type.Integer()),
      title: Type.String(),
      text: Type.String(),
    },
    {
      title: 'posts',
    }
  ),
});
