import { PageProps, useServerSideQuery } from "rakkasjs";
import { loadEntityData } from "src/db/load-entity-data";
import Form from "@rjsf/bootstrap-4";
import validator from "@rjsf/validator-ajv8";

const DetailPage = ({ params }: PageProps) => {
  const entityName = params.entity;
  const id = params.id;

  const { data, refetch } = useServerSideQuery(() =>
    loadEntityData({ entityName, byId: id })
  );

  return (
    <>
      <pre>{JSON.stringify(data?.entity, undefined, 2)}</pre>
      <Form
        schema={data?.schema}
        formData={data?.entity}
        // onSubmit={async (data) => {
        //   const formData = data.formData;
        //   console.log(formData);
        //   await mutation.mutateAsync({ data: formData });
        // }}
        validator={validator}
      />
    </>
  );
};

export default DetailPage;
