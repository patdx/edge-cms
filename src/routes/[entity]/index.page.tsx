import {
  ActionContext,
  ActionResult,
  Link,
  PageProps,
  useServerSideMutation,
  useServerSideQuery,
} from "rakkasjs";
import { insertItem, loadEntityData } from "src/db/load-entity-data";
import validator from "@rjsf/validator-ajv8";
import Form from "@rjsf/bootstrap-4";
import type { UiSchema } from "@rjsf/utils";

// trigger classes in Daisy UI:
// form-control form-group btn btn-primary

const uiSchema: UiSchema = {
  "ui:options": {
    // classNames: "input",
    // "title": "Title",
    // "description": "Description",
    // "classNames": "my-class",
    // "submitButtonOptions": {
    //   "props": {
    //     "disabled": false,
    //     "className": "btn btn-info",
    //   },
    //   "norender": false,
    //   "submitText": "Submit"
    // }
  },
};

const EntityPage = ({ params }: PageProps) => {
  const entityName = params.entity;

  const { data, refetch } = useServerSideQuery(() =>
    loadEntityData({ entityName, withEntities: true })
  );

  const mutation = useServerSideMutation<
    any,
    {
      data: any;
    }
  >(
    async (context, vars) => {
      console.log({ vars });
      await insertItem(entityName, vars.data);
    },
    {
      onSuccess() {
        refetch();
      },
    }
  );

  const { entities, ...remaining } = data ?? {};

  return (
    <>
      <h2>{entityName}</h2>
      <Form
        schema={data?.schema}
        onSubmit={async (data) => {
          const formData = data.formData;
          console.log(formData);
          await mutation.mutateAsync({ data: formData });
        }}
        validator={validator}
      />
      {entities?.map((entity) => (
        <Link
          href={`/${entityName}/${entity.id}`}
          className="block whitespace-pre-wrap hover:opacity-75"
        >
          {JSON.stringify(entity, undefined, 2)}
        </Link>
      ))}
      <pre>{JSON.stringify(remaining, undefined, 2)}</pre>
    </>
  );
};

export default EntityPage;

// export async function action({ ctx }: { ctx: ActionContext; }): Promise<ActionResult> {}
