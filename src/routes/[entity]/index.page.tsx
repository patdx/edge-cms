import Form from "@rjsf/semantic-ui";
import validator from "@rjsf/validator-ajv8";
import {
  Link,
  PageProps,
  useServerSideMutation,
  useServerSideQuery,
} from "rakkasjs";
import { insertItem, loadEntityData } from "src/db/load-entity-data";

const EntityPage = ({ params }: PageProps) => {
  const entityName = params.entity;

  // TODO: figure out how to filter out default urls like favicon.ico
  // more effectively to avoid error messagesq

  const { data, refetch } = useServerSideQuery((context) =>
    loadEntityData({ context, entityName, withEntities: true })
  );

  const mutation = useServerSideMutation<
    any,
    {
      data: any;
    }
  >(
    async (context, vars) => {
      await insertItem(context, entityName, vars.data);
    },
    {
      onSettled() {
        refetch();
      },
    }
  );

  const { entities, ...remaining } = data ?? {};

  return (
    <div className="p-2">
      <h2>{entityName}</h2>
      <Form
        schema={data?.schema ?? {}}
        onSubmit={async (data) => {
          const formData = data.formData;
          console.log(formData);
          await mutation.mutateAsync({ data: formData });
        }}
        uiSchema={{
          "ui:submitButtonOptions": {
            submitText: "Create",
          },
        }}
        validator={validator}
      />
      {entities?.map((entity) => (
        <Link
          key={entity.id}
          href={`/${entityName}/${entity.id}`}
          className="block whitespace-pre-wrap hover:opacity-75"
        >
          {JSON.stringify(entity, undefined, 2)}
        </Link>
      ))}
      <pre>{JSON.stringify(remaining, undefined, 2)}</pre>
    </div>
  );
};

export default EntityPage;
