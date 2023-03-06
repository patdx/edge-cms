import { createMiddleware } from 'rakkasjs/node-adapter';
import hattipHandler from './entry-hattip';
import { D1Database, D1DatabaseAPI } from '@miniflare/d1';
import { createSQLiteDB } from '@miniflare/shared';
import fs from 'fs';

fs.mkdirSync('./data', { recursive: true });

const dbPromise = Promise.resolve()
  // .then(() => createSQLiteDB(":memory:"))
  .then(() => createSQLiteDB('./data/data.db'))
  .then((db) => new D1Database(new D1DatabaseAPI(db)))
  .then(async (db) => {
    // simulate the extra system tables of the real cloudflare d1 database
    await db.exec(
      `CREATE TABLE IF NOT EXISTS d1_kv (key TEXT PRIMARY KEY, value TEXT)`
    );

    return db;
  });

export default createMiddleware(async (context) => {
  const db = await dbPromise;
  context.platform.env = context.platform.env ?? {};
  context.platform.env.CLOUDFLARE_DB = db;
  return hattipHandler(context);
});
