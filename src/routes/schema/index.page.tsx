// import { useServerSideMutation, useServerSideQuery } from "rakkasjs";
// import { getOrm } from "src/db/mikro-orm";

import { useServerSideMutation, useServerSideQuery } from "rakkasjs";
import { getAllCreateQueries } from "src/db/migrator/create-table";
import { getOrm } from "src/db/orm";

const SchemaPage = () => {
  const query = useServerSideQuery(async (context) => {
    const schema = await getOrm(context)
      .DB.prepare("SELECT * from sqlite_schema")
      .all<{ type: string; name: string; tbl_name: string; sql: string }>();

    console.log("db result", schema);

    await Promise.all(
      schema.results?.map(async (row) => {
        const cols = await getOrm(context)
          .DB.prepare(`PRAGMA table_info(${row.name})`)
          .all();

        row.cols = cols.results;
      }) ?? []
    );

    const updateDump = getAllCreateQueries();

    return { updateDump, schema: schema.results };
  });

  const update = useServerSideMutation(
    async (context) => {
      const statements = getAllCreateQueries();
      const DB = getOrm(context).DB;
      await DB.batch(statements.map((statement) => DB.prepare(statement)));

      // exec();
    },
    {
      onSettled() {
        query.refetch();
      },
    }
  );

  return (
    <>
      <h2>Pending schema changes:</h2>
      {query.data.updateDump.map((line) => (
        <pre key={line}>{line || "None"}</pre>
      ))}

      {Array.isArray(query.data.schema) && query.data.schema.length >= 1 ? (
        <pre>{JSON.stringify(query.data.schema, undefined, 2)}</pre>
      ) : (
        <pre>(No tables yet)</pre>
      )}

      <button className="btn btn-danger" onClick={() => update.mutate()}>
        Update schema
      </button>
    </>
  );
};

export default SchemaPage;
