import type { RequestContext } from "rakkasjs";
import type { D1Database } from "@cloudflare/workers-types";

export const getOrm = (context: RequestContext) => {
  const DB = context.platform.env.CLOUDFLARE_DB as D1Database;

  return {
    find: () => [],
    findOne: () => {},
    DB,
  };
};
