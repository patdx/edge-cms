import validator from '@rjsf/validator-ajv8';
import type { JSONSchema6 } from 'json-schema';
import {
  Link,
  PageProps,
  useServerSideMutation,
  useServerSideQuery,
} from 'rakkasjs';
import { Show } from 'src/components/show';
import { ViewEntity } from 'src/components/view-entity';
import { loadEntityData, updateItem } from 'src/db/load-entity-data';
import { MyForm } from 'src/json-schema-form';
import { flattenJson } from 'src/utils/flatten-json';

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

  const schema = data?.schema;

  // we just pass the whole thing through for now, to
  // make it easy to pass properties inside one
  // schema

  const uiSchema = schema.properties ?? {};

  return (
    <div className="p-2 flex flex-col gap-2">
      <div className="text-sm breadcrumbs">
        <ul>
          <li>
            <Link href={`/${entityName}`}>{entityName}</Link>
          </li>
          <li>
            <Link href={`/${entityName}/${id}`}>{id}</Link>
          </li>
          <li>
            <a>Edit</a>
          </li>
        </ul>
      </div>

      <div className="flex gap-2">
        <Link href={`/${entityName}/${id}`} className="btn btn-primary">
          Cancel
        </Link>
      </div>

      <Show
        when={data.readOnly === false}
        fallback={
          <div className="p-4">
            This item is read only and cannot be edited.
          </div>
        }
      >
        <div className="card card-bordered card-compact shadow">
          <div className="card-body">
            <h2 className="card-title">Edit</h2>
            <MyForm
              schema={schema as any}
              uiSchema={{
                ...uiSchema,
                'ui:submitButtonOptions': {
                  submitText: 'Save',
                },
              }}
              formData={flattenJson(schema, data?.entity)}
              onSubmit={async (data) => {
                const formData = data.formData;
                console.log(formData);
                await mutation.mutateAsync({ data: formData });
              }}
              validator={validator}
            />
          </div>
        </div>
      </Show>
    </div>
  );
};

export default DetailPage;
