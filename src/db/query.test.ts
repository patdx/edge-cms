import { describe, expect, it } from "vitest";
import { Post } from "./entities";
import { getCreateTableQuery } from "./get-query-query";

describe("can create table", () => {
  it("post table", () => {
    expect(
      getCreateTableQuery(Post, {
        name: "Post",
      })
    ).toMatchInlineSnapshot(
      '"CREATE TABLE Post (id INTEGER PRIMARY KEY, title TEXT NOT NULL, text TEXT NOT NULL) STRICT;"'
    );
  });

  // it("match formatting")
});
