// import { useServerSideMutation, useServerSideQuery } from "rakkasjs";
// import { getOrm } from "src/db/mikro-orm";

import {
  useQueryClient,
  useServerSideMutation,
  useServerSideQuery,
} from "rakkasjs";
import { defaultEntities } from "src/db/entities";
import { insertItem } from "src/db/load-entity-data";
import { convertManyJsonSchemasToDatabaseSchema } from "src/db/migrator/convert-schema";
import {
  diffSchema,
  generateManyMigrationStepsSql,
} from "src/db/migrator/diff-schema";
import { introspectDatabase } from "src/db/migrator/introspect-database";
import { isSystemTable } from "src/db/migrator/shared";
import { SchemaTable, systemTables } from "src/db/migrator/system-tables";
import { getOrm } from "src/db/orm";

const SchemaPage = () => {
  const query = useServerSideQuery(
    async (context) => {
      const orm = getOrm(context);

      const getDatabaseStatus = () =>
        introspectDatabase((sql) =>
          getOrm(context)
            .DB.prepare(sql)
            .all()
            .then((result) => result.results!)
        );

      const databaseStatus = await getDatabaseStatus();

      console.log(`current db status`, databaseStatus);

      const oldStatus = databaseStatus.filter((table) =>
        table.name?.startsWith("_")
      ); // system table starts with "_"
      const targetStatus = convertManyJsonSchemasToDatabaseSchema(
        Object.values(systemTables)
      );

      // sync system tables
      const systemTableMigrationSteps = diffSchema(oldStatus, targetStatus);

      const lines = generateManyMigrationStepsSql(systemTableMigrationSteps);

      console.log(
        `Initialization script: ${JSON.stringify(lines, undefined, 2)}`
      );

      await getOrm(context).DB.batch(
        lines.map((line) => getOrm(context).DB.prepare(line))
      );
      // finish sync

      const databaseTables = await getDatabaseStatus();

      const schemas = await orm.find<SchemaTable>("_schemas");

      const updateDump = generateManyMigrationStepsSql(
        diffSchema(
          databaseTables.filter((item) => !isSystemTable(item)),
          convertManyJsonSchemasToDatabaseSchema(
            schemas.map((schema) =>
              schema.json ? JSON.parse(schema.json) : undefined
            )
          )
        )
      );

      return { updateDump, schema: databaseTables };
    },
    {
      key: "overall-database-status",
    }
  );

  const queryClient = useQueryClient();

  const syncDatabaseSchema = useServerSideMutation(
    async (context) => {
      const orm = getOrm(context);
      const { DB } = orm;

      const getDatabaseTables = () =>
        introspectDatabase((sql) =>
          getOrm(context)
            .DB.prepare(sql)
            .all()
            .then((result) => result.results!)
        );

      const databaseTables = await getDatabaseTables();

      const schemas = await orm.find<SchemaTable>("_schemas");

      const lines = generateManyMigrationStepsSql(
        diffSchema(
          databaseTables.filter((item) => !isSystemTable(item)),
          convertManyJsonSchemasToDatabaseSchema(
            schemas.map((schema) =>
              schema.json ? JSON.parse(schema.json) : undefined
            )
          )
        )
      );

      console.log(`running these lines: ${JSON.stringify(lines)}`);

      await DB.batch(lines.map((statement) => DB.prepare(statement)));

      // exec();
    },
    {
      onSettled() {
        queryClient.invalidateQueries([
          "overall-database-status",
          "available-entities",
        ]);
      },
    }
  );

  return (
    <div className="p-2 flex flex-col gap-2">
      <AdminTools />

      <div className="p-2 rounded border shadow">
        {/* TODO: make sure this automatically invalidates when updating _schemas table */}
        <h2>Pending schema changes:</h2>
        {query.data.updateDump.length === 0 ? (
          <p>No pending changes.</p>
        ) : (
          <button
            className="btn btn-danger transition bg-orange-300 hover:bg-orange-400 p-1"
            onClick={() => syncDatabaseSchema.mutate()}
          >
            Apply changes
          </button>
        )}
        {query.data.updateDump.map((line) => (
          <pre key={line}>{line || "None"}</pre>
        ))}
      </div>

      <div className="p-2 rounded border shadow">
        <h2>Current database schema</h2>
        <div className="flex flex-col gap-2">
          {Array.isArray(query.data.schema) && query.data.schema.length >= 1 ? (
            query.data.schema.map((item) => (
              <div key={item.name} className="p-2 rounded border shadow">
                <h4>{item.name}</h4>
                {item.columns.map((column) => {
                  const { name, ...remaining } = column;
                  return (
                    <div>
                      <strong>{name}</strong>{" "}
                      <pre className="inline">{JSON.stringify(remaining)}</pre>
                    </div>
                  );
                })}
              </div>
            ))
          ) : (
            <pre>(No tables yet)</pre>
          )}
        </div>
      </div>
    </div>
  );
};

const AdminTools = () => {
  const queryClient = useQueryClient();

  const deleteAllTables = useServerSideMutation(
    async (context) => {
      const DB = getOrm(context).DB;

      const tables = await DB.prepare(
        `SELECT name FROM sqlite_schema WHERE type = 'table'`
      ).all<{ name: string }>();

      console.log(tables.results);

      const lines =
        tables.results?.map((table) => `DROP TABLE ${table.name}`) ?? [];

      console.log(lines);

      await DB.batch(lines.map((line) => DB.prepare(line)));

      // const schema = await getDatabaseStatus();

      // const lines = generateManyMigrationStepsSql(
      //   diffSchema(
      //     schema.filter((item) => !item.name.startsWith("_")),
      //     convertManyJsonSchemasToDatabaseSchema(Object.values(entities))
      //   )
      // );

      // const DB = getOrm(context).DB;
      // await DB.batch(lines.map((statement) => DB.prepare(statement)));

      // exec();
    },
    {
      onSettled() {
        queryClient.invalidateQueries([
          "overall-database-status",
          "available-entities",
        ]);
      },
    }
  );

  const setUpDefaultSchemas = useServerSideMutation(
    async (context) => {
      // const DB = getOrm(context).DB;

      // TODO: support insert in batch
      await Promise.allSettled(
        Object.values(defaultEntities).map(async (entity) => {
          await insertItem(context, "_schemas", {
            json: JSON.stringify(entity), // , undefined, 2
          });
        })
      );
    },
    {
      onSettled() {
        queryClient.invalidateQueries([
          "overall-database-status",
          "available-entities",
        ]);
      },
    }
  );

  return (
    <div className="p-2 rounded border shadow">
      <h2>Tools</h2>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => deleteAllTables.mutate()}
          className="btn btn-danger transition bg-orange-300 hover:bg-orange-400 p-1 rounded"
        >
          Delete all tables
        </button>
        <button
          type="button"
          onClick={() => setUpDefaultSchemas.mutate()}
          className="btn btn-danger transition bg-orange-300 hover:bg-orange-400 p-1 rounded"
        >
          Set up default schemas
        </button>
      </div>
    </div>
  );
};

export default SchemaPage;
