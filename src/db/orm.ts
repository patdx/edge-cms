import type { RequestContext } from "rakkasjs";
import type { D1Database } from "@cloudflare/workers-types";
import { entities } from "./entities";
import type { JSONSchema7 } from "json-schema";

export const getOrm = (context: RequestContext) => {
  const DB = (context.platform as any).env.CLOUDFLARE_DB as D1Database;

  return {
    find: (entityName: keyof typeof entities) =>
      DB.prepare(`SELECT * FROM ${entityName}`)
        .all()
        .then((result) => result.results),
    findOne: (entityName: keyof typeof entities, id: string | number) =>
      DB.prepare(`SELECT * FROM ${entityName} LIMIT 1`).first(),
    DB,
  };
};

export const getEntity = (entityName: string) => {
  const entity = (entities as any)[entityName] as any as JSONSchema7;
  if (!entity) {
    throw new Error(`Could not find entity ${JSON.stringify(entityName)}`);
  }
  return entity;
};
