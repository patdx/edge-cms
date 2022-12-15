import { defineConfig, MikroORM } from "@mikro-orm/core";
import type { Options } from "@mikro-orm/core";
import { CloudflareD1Driver } from "./D1Driver";

/**
 * @inheritDoc
 */
export class CloudflareD1MikroORM extends MikroORM<CloudflareD1Driver> {
  private static DRIVER = CloudflareD1Driver;
}

export type CloudflareD1Options = Options<CloudflareD1Driver>;

/* istanbul ignore next */
export function defineCloudflareD1Config(options: CloudflareD1Options) {
  return defineConfig({ driver: CloudflareD1Driver, ...options });
}
