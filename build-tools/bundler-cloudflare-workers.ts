import { build, BuildOptions } from "esbuild";
import { builtinModules } from "module";
import path from "path";

// https://github.com/hattipjs/hattip/blob/main/packages/bundler/bundler-cloudflare-workers/src/index.ts

/**
 * Bundling options
 */
export interface BundlingOptions {
  /**
   * Module file that default exports a HatTip handler.
   * You have to provide either this or `cfwEntry`, but
   * not both.
   */
  handlerEntry?: string;
  /**
   * Whether to serve static files. Make sure to specify
   * `site = { bucket = "static-dir" }` in your `wrangler.toml`
   * or set this to `false`. @default true
   */
  serveStaticFiles?: boolean;
  /**
   * Custom Cloudflare Workers entry file. It's mutually exclusive with
   * `handlerEntry`.
   */
  cfwEntry?: string;
  /** Output file name for the bundle */
  output: string;
}

export default async function bundle(
  options: BundlingOptions,
  manipulateEsbuildOptions?: (options: BuildOptions) => void | Promise<void>
) {
  const { cfwEntry, handlerEntry, output, serveStaticFiles } = options;

  if (!cfwEntry) {
    if (!handlerEntry) {
      throw new Error("Must provide either cfwEntry or handlerEntry");
    }
  } else {
    if (handlerEntry) {
      throw new Error("Cannot provide both cfwEntry and handlerEntry");
    }

    if (serveStaticFiles !== undefined) {
      throw new Error("Cannot provide serveStaticFiles with cfwEntry");
    }
  }

  const esbuildOptions: BuildOptions = {
    logLevel: "info",
    bundle: true,
    // minify: true // temporarily disabled for easier debugging
    entryPoints: [cfwEntry ?? "virtual:entry-cfw.js"],
    outfile: output,
    platform: "browser",
    target: "chrome96",
    format: "esm",
    mainFields: ["module", "main", "browser"],
    conditions: ["worker", "import", "require"],
    external: [
      // ...builtinModules,
      "async_hooks",
      "__STATIC_CONTENT_MANIFEST",
      // SPECIAL CHANGES,
      "@mikro-orm/better-sqlite",
      "@mikro-orm/entity-generator",
      "@mikro-orm/mariadb",
      "@mikro-orm/migrations",
      "@mikro-orm/migrations-mongodb",
      "@mikro-orm/mongodb",
      "@mikro-orm/mysql",
      "@mikro-orm/postgresql",
      "@mikro-orm/seeder",
      "@mikro-orm/sqlite",
    ],
    define: {
      "process.env.NODE_ENV": '"production"', // must set separately when not minifying
      "process.versions.node": '"16.0.0"',
    },
    treeShaking: true,
    plugins: [],
  };

  if (!cfwEntry) {
    esbuildOptions.plugins!.push(
      ...[
        {
          name: "hattip-virtual-cfw-entry",
          setup(build) {
            build.onResolve(
              {
                filter: /^virtual:entry-cfw\.js$/,
              },
              () => ({
                path: "virtual:entry-cfw.js",
                namespace: "hattip-virtual-cfw-entry",
              })
            );

            build.onLoad(
              {
                filter: /.*/,
                namespace: "hattip-virtual-cfw-entry",
              },
              () => {
                return {
                  resolveDir: process.cwd(),
                  contents: getCfwEntryContents(
                    handlerEntry!,
                    serveStaticFiles === false
                      ? "@hattip/adapter-cloudflare-workers/no-static"
                      : "@hattip/adapter-cloudflare-workers"
                  ),
                };
              }
            );
          },
        },
      ]
    );
  }

  await manipulateEsbuildOptions?.(esbuildOptions);
  await build(esbuildOptions);
}

function getCfwEntryContents(handlerEntry: string, adapter: string) {
  const relativeName = path.relative(process.cwd(), handlerEntry);

  return `
  import cloudflareWorkersAdapter from ${JSON.stringify(adapter)};
  import handler from ${JSON.stringify("./" + relativeName)};

  export default {
    fetch: cloudflareWorkersAdapter(handler),
  };
  `;
}
