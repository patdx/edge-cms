import type { D1Database } from '@cloudflare/workers-types';
import type { JSONSchema6 } from 'json-schema';
import type { RequestContext } from 'rakkasjs';

export const getOrm = (context: RequestContext) => {
  const DB = (context.platform as any).env.CLOUDFLARE_DB as D1Database;

  return {
    find: async <T = any>(
      entityName: string,
      schema?: JSONSchema6
    ): Promise<T[]> => {
      if (schema) {
        const properties = Object.entries(schema.properties ?? []);

        const query = `SELECT json_object(${properties
          .map(([propName, propOptions]) => {
            const isJson = propOptions['ui:widget'] === 'json';

            return `'${propName}', ${isJson ? `json(${propName})` : propName}`;
          })
          .join(', ')}) AS json_str FROM ${entityName}`;

        console.log(query);

        const found = await DB.prepare(query).all<{ json_str: string }>();

        return found.results?.map((item) => JSON.parse(item.json_str)) ?? [];

        // TODO: for some reason I get a different result in the sqlite3 cli (desired)
        // versus sqlite API (not desired) with the following code, even though it seems
        // better...?

        // const innerQuery = `SELECT json_object(${properties
        //   .map(([propName, propOptions]) => {
        //     const isJson = propOptions['ui:widget'] === 'json';

        //     return `'${propName}', ${isJson ? `json(${propName})` : propName}`;
        //   })
        //   .join(', ')}) AS json_str FROM ${entityName}`;

        // const query = `SELECT json_group_array(json_str) AS json_array_str FROM (${innerQuery})`;

        // console.log(query);

        // const found = await DB.prepare(query).first('json_array_str');

        // console.log(`found:`, typeof found, found);

        // return typeof found === 'string' ? JSON.parse(found) : undefined;
      } else {
        return DB.prepare(`SELECT * FROM ${entityName}`)
          .all()
          .then((result) => result.results) as any;
      }
    },
    findOne: async <T = any>(
      entityName: string,
      id: string | number,
      schema?: JSONSchema6
    ): Promise<T | undefined> => {
      if (schema) {
        // if we have the schema object, we know which properties are actually
        // nested json value, and the named properties, so we can ask sqlite
        // to bundle the whole thing up in one ready-to-go JSON string object

        const properties = Object.entries(schema.properties ?? []);

        const query = `SELECT json_object(${properties
          .map(([propName, propOptions]) => {
            const isJson = propOptions['ui:widget'] === 'json';

            return `'${propName}', ${isJson ? `json(${propName})` : propName}`;
          })
          .join(
            ', '
          )}) AS json_str FROM ${entityName} WHERE id = ${id} LIMIT 1`;

        console.log(query);

        const found = await DB.prepare(query).first('json_str');

        return typeof found === 'string' ? JSON.parse(found) : undefined;
      } else {
        const found = await DB.prepare(
          `SELECT * FROM ${entityName} WHERE id = ${id} LIMIT 1`
        ).first();

        return found as any;
      }

      // TODO: make parameterized

      // if (found && schema) {
      //   for (const [propName, propOptions] of Object.entries(
      //     schema.properties ?? {}
      //   )) {
      //     if (
      //       typeof found[propName] === 'string' &&
      //       propOptions['ui:widget'] === 'json'
      //     ) {
      //       try {
      //         found[propName] = JSON.parse(found[propName]);
      //       } catch (err) {
      //         // ignore for now
      //       }
      //     }
      //   }
      // }

      // return found as any;
    },
    DB,
  };
};
