import type { D1Database } from "@cloudflare/workers-types";
import type { RequestContext } from "rakkasjs";

export const getOrm = (context: RequestContext) => {
  const DB = (context.platform as any).env.CLOUDFLARE_DB as D1Database;

  return {
    find: <T = any>(entityName: string): Promise<T[]> =>
      DB.prepare(`SELECT * FROM ${entityName}`)
        .all()
        .then((result) => result.results) as any,
    findOne: <T = any>(
      entityName: string,
      id: string | number
    ): Promise<T | undefined> =>
      DB.prepare(`SELECT * FROM ${entityName} LIMIT 1`).first(),
    DB,
  };
};
