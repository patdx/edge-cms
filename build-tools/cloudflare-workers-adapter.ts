import type { RakkasOptions } from "rakkasjs/vite-plugin";
import cloudflareWorkers from "./bundler-cloudflare-workers";
import fs from "fs";
import path from "path";

// https://github.com/rakkasjs/rakkasjs/blob/main/packages/rakkasjs/src/vite-plugin/adapters.ts

const CLOUDFLARE_WORKERS_ENTRY = `
	import cloudflareWorkersAdapter from "@hattip/adapter-cloudflare-workers";
	let handler;
	export default {
		async fetch(req, env, ctx) {
			if (!globalThis.process?.env) {
				globalThis.process = globalThis.process || {};
				globalThis.process.env = new Proxy({}, {
					get(_, key) {
						if (typeof env[key] === "string") {
							return env[key];
						}
						return undefined;
					}
				});
			}
			if (!handler) {
				const hattipHandler = await import("./hattip.js");
				handler = cloudflareWorkersAdapter(hattipHandler.default);
			}
			return handler(req, env, ctx);
		}
	};
`;

export const cloudflareWorkersCustomAdapter: RakkasOptions["adapter"] = {
  name: "cloudflare-workers",
  async bundle(root: string) {
    let entry = findEntry(root, "src/entry-cloudflare-workers");

    if (!entry) {
      entry = path.resolve(root, "dist/server/entry-cloudflare-workers.js");
      await fs.promises.writeFile(entry, CLOUDFLARE_WORKERS_ENTRY);
    }

    cloudflareWorkers(
      {
        output: path.resolve(root, "dist/server/cloudflare-workers-bundle.js"),
        cfwEntry: entry,
      },
      (options) => {
        options.define = options.define || {};
        options.define["process.env.RAKKAS_PRERENDER"] = "undefined";
        options.define["global"] = "globalThis";
      }
    );
  },
};

function findEntry(root: string, name: string) {
  const entries = [
    path.resolve(root, name) + ".ts",
    path.resolve(root, name) + ".js",
    path.resolve(root, name) + ".tsx",
    path.resolve(root, name) + ".jsx",
  ];

  return entries.find((entry) => fs.existsSync(entry));
}
