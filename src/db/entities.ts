import { Type } from "@sinclair/typebox";

export const Category = Type.Object({
  id: Type.Optional(Type.Integer()),
  name: Type.String(),
});

export const Post = Type.Object({
  id: Type.Optional(Type.Integer()),
  title: Type.String(),
  text: Type.String(),
});

export const ENTITIES = [Category, Post];

export const ENTITY_MAP = {
  Category,
  Post,
};
