import Form from "@rjsf/semantic-ui";
import validator from "@rjsf/validator-ajv8";
import type { JSONSchema6, JSONSchema6Object } from "json-schema";
import {
  Link,
  PageProps,
  useServerSideMutation,
  useServerSideQuery,
} from "rakkasjs";
import { Details } from "src/components/details";
import { insertItem, loadEntityData } from "src/db/load-entity-data";
import { widgets } from "src/json-schema-form";

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

  const schema = data?.schema ?? ({} as JSONSchema6);

  // we just pass the whole thing through for now, to
  // make it easy to pass properties inside one
  // schema

  const uiSchema = schema.properties ?? {};

  return (
    <div className="p-2 flex flex-col gap-2">
      <Details summary="JSON Schema">
        <pre>{JSON.stringify(schema, undefined, 2)}</pre>
      </Details>

      {/* <h2>{entityName}</h2> */}
      <Form
        schema={schema}
        onSubmit={async (data) => {
          const formData = data.formData;
          console.log(formData);
          await mutation.mutateAsync({ data: formData });
        }}
        widgets={widgets}
        uiSchema={{
          ...uiSchema,
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
    </div>
  );
};

export default EntityPage;
