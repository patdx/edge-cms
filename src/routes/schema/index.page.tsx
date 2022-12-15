import { useServerSideMutation, useServerSideQuery } from "rakkasjs";
import { getOrm } from "src/db/mikro-orm";

const SchemaPage = () => {
  const query = useServerSideQuery(async (context) => {
    const orm = await getOrm(context).orm;
    const generator = orm.getSchemaGenerator();

    const updateDump = await generator.getUpdateSchemaSQL();
    console.log(updateDump);

    return { updateDump };
  });

  const update = useServerSideMutation(
    async (context) => {
      const orm = await getOrm(context).orm;
      await orm.getSchemaGenerator().updateSchema();
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
      <pre>{query.data.updateDump || "None"}</pre>
      <button className="btn btn-danger" onClick={() => update.mutate()}>
        Update schema
      </button>
    </>
  );
};

export default SchemaPage;
