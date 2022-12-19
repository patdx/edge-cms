import { Type } from "@sinclair/typebox";

const defineEntities = <T extends Record<string, unknown>>(entities: T) =>
  entities;

export const entities = defineEntities({
  categories: Type.Object({
    id: Type.Optional(Type.Integer()),
    name: Type.String(),
  }),
  posts: Type.Object({
    id: Type.Optional(Type.Integer()),
    title: Type.String(),
    text: Type.String(),
  }),
});
