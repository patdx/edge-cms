import { createMiddleware } from "rakkasjs/node-adapter";
import hattipHandler from "./entry-hattip";
import { BetaDatabase } from "@miniflare/d1";
import { createSQLiteDB } from "@miniflare/shared";
import fs from "fs";

fs.mkdirSync("./data", { recursive: true });

const dbPromise = Promise.resolve()
  // .then(() => createSQLiteDB(":memory:"))
  .then(() => createSQLiteDB("./data/data.db"))
  .then((db) => new BetaDatabase(db));

export default createMiddleware(async (context) => {
  const db = await dbPromise;
  context.platform.env = context.platform.env ?? {};
  context.platform.env.CLOUDFLARE_DB = db;
  return hattipHandler(context);
});
