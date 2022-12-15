import type { Configuration } from "@mikro-orm/core";
import { AbstractSqlDriver } from "@mikro-orm/knex";
import { CloudflareD1Connection } from "./D1Connection";
import { CloudflareD1Platform } from "./D1Platform";

export class CloudflareD1Driver extends AbstractSqlDriver<CloudflareD1Connection> {
  constructor(config: Configuration) {
    super(config, new CloudflareD1Platform(), CloudflareD1Connection, ["knex"]);
  }
}
