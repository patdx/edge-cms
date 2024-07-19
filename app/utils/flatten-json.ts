import type { JSONSchema6 } from 'json-schema';

export const flattenJson = (
	schema?: JSONSchema6,
	data?: Record<string, any>,
) => {
	const newData: Record<string, any> = {};

	const properties = Object.entries(schema?.properties ?? []);

	for (const [propName, propOptions] of properties) {
		const isJson = (propOptions as any)['ui:widget'] === 'json';

		if (isJson) {
			newData[propName] = JSON.stringify(data?.[propName], undefined, 2);
		} else {
			newData[propName] = data?.[propName];
		}
	}

	return newData;
};
