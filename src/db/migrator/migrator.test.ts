import { describe, expect, test } from "vitest";
import { entities } from "../entities";
import { convertJsonSchemaToDatabaseSchema } from "./convert-schema";

describe("migratior", () => {
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
