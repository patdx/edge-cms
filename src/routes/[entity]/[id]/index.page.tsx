import {
  Link,
  PageProps,
  useServerSideMutation,
  useServerSideQuery,
} from "rakkasjs";
import { loadEntityData, updateItem } from "src/db/load-entity-data";
import Form from "@rjsf/semantic-ui";
import validator from "@rjsf/validator-ajv8";
import { widgets } from "src/json-schema-form";

// console.log("entity details page");

const DetailPage = ({ params }: PageProps) => {
  const entityName = params.entity;
  const id = params.id;

  const { data, refetch } = useServerSideQuery((context) =>
    loadEntityData({ context, entityName, byId: id })
  );

  const mutation = useServerSideMutation<
    any,
    {
      data: any;
    }
  >(
    async (context, vars) => {
      await updateItem(context, entityName, vars.data);
    },
    {
      onSettled() {
        refetch();
      },
    }
  );

  const schema = data?.schema ?? ({} as JSONSchema6);

  // we just pass the whole thing through for now, to
  // make it easy to pass properties inside one
  // schema

  const uiSchema = schema.properties ?? {};

  return (
    <div className="p-2">
      <h2>
        <Link href={`/${entityName}`}>{entityName}</Link> {id}
      </h2>
      <pre>{JSON.stringify(data?.entity, undefined, 2)}</pre>
      <Form
        schema={schema}
        uiSchema={{
          ...uiSchema,
          "ui:submitButtonOptions": {
            submitText: "Save",
          },
        }}
        formData={data?.entity}
        widgets={widgets}
        onSubmit={async (data) => {
          const formData = data.formData;
          console.log(formData);
          await mutation.mutateAsync({ data: formData });
        }}
        validator={validator}
      />
    </div>
  );
};

export default DetailPage;
