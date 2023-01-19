import TOML from '@ltd/j-toml';
import fs from 'fs';
import child_process from 'child_process';

/** @type {import('../secrets.json') | undefined} */
let secrets = undefined;

try {
  const result = child_process.execSync('sops --decrypt secrets.json', {
    encoding: 'utf8',
  });
  secrets = JSON.parse(result);
} catch (err) {
  console.log(
    `Could not decrypt secrets. Some values may be missing. Error:` + '\n' + err
  );
}

const config = {
  account_id: secrets?.account_id ?? null,
  compatibility_date: '2022-12-14',
  compatibility_flags: [],
  d1_databases: [
    {
      binding: 'CLOUDFLARE_DB',
      database_id: secrets?.database_id ?? null,
      database_name: 'edge-cms-db',
      preview_database_id: secrets?.preview_database_id ?? null,
    },
  ],
  main: 'dist/server/cloudflare-workers-bundle.js',
  name: 'edge-cms',
  site: {
    bucket: './dist/client',
  },
  workers_dev: true,
};

fs.writeFileSync(
  new URL('../wrangler.toml', import.meta.url),
  // @ts-ignore
  TOML.stringify(config, {
    newline: '\n',
    // Not sure how to handle this. I wish it would just ignore undefined values, or generate commented placeholders, etc...
    xNull: true,
  })
);
