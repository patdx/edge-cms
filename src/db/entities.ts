import { Type } from '@sinclair/typebox';

const defineEntities = <T extends Record<string, unknown>>(entities: T) =>
	entities;

export const defaultEntities = defineEntities({
	categories: Type.Object(
		{
			id: Type.Optional(Type.Integer()),
			name: Type.String(),
			description: Type.Optional(
				Type.String({
					'ui:widget': 'textarea',
					'ui:options': {
						rows: 4,
					},
				}),
			),
		},
		{
			title: 'categories',
		},
	),
	posts: Type.Object(
		{
			id: Type.Optional(Type.Integer()),
			title: Type.String(),
			text: Type.Optional(
				Type.String({
					'ui:widget': 'textarea',
					'ui:options': {
						rows: 4,
					},
				}),
			),
		},
		{
			title: 'posts',
		},
	),
});
