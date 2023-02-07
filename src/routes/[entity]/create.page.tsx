import validator from '@rjsf/validator-ajv8';
import {
  Link,
  PageProps,
  useServerSideMutation,
  useServerSideQuery
} from 'rakkasjs';
import { Details } from 'src/components/details';
import { insertItem, loadEntityData } from 'src/db/load-entity-data';
import { MyForm } from 'src/json-schema-form';
import { compactStringify } from 'src/utils/compact-stringify';

const CreatePage = ({ params }: PageProps) => {
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
            Create
          </li>
        </ul>
      </div>

      <Details summary="JSON Schema">
        <pre>{compactStringify(schema)}</pre>
      </Details>

      <div className="card card-bordered card-compact shadow">
        <div className="card-body">
          <h2 className="card-title">Create</h2>
          <MyForm
            schema={schema}
            onSubmit={async (data) => {
              const formData = data.formData;
              console.log(formData);
              await mutation.mutateAsync({ data: formData });
            }}
            uiSchema={{
              ...uiSchema,
              'ui:submitButtonOptions': {
                submitText: 'Create',
              },
            }}
            validator={validator}
          />
        </div>
      </div>
    </div>
  );
};

export default CreatePage;
