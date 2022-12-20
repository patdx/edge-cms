import { describe, expect, test } from "vitest";
import { entities } from "../entities";
import { convertJsonSchemaToDatabaseSchema } from "./convert-schema";

// How migration works
// 1. convert desired schema to entity format
// 2. convert actual database to entity format
// 3. diff these and figure out the SQL steps to
/// solve this mystery

describe("migrator", () => {
  test("convert json schema to entity format", () => {
    expect(convertJsonSchemaToDatabaseSchema(entities.categories))
      .toMatchInlineSnapshot(`
      {
        "columns": [],
        "name": undefined,
        "tbl_name": undefined,
        "type": "table",
      }
    `);
  });
});
