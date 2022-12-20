import { describe, expect, it } from "vitest";
import { entities } from "./entities";
import { getCreateTableQuery } from "./migrator/create-table";

describe("can create table", () => {
  it("post table", () => {
    expect(
      getCreateTableQuery(entities.posts, {
        name: "posts",
      })
    ).toMatchInlineSnapshot(
      '"CREATE TABLE Post (id INTEGER PRIMARY KEY, title TEXT NOT NULL, text TEXT NOT NULL) STRICT;"'
    );
  });

  // it("match formatting")
});
