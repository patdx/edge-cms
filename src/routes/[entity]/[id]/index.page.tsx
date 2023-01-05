import validator from '@rjsf/validator-ajv8';
import type { JSONSchema6 } from 'json-schema';
import {
  Link,
  PageProps,
  useServerSideMutation,
  useServerSideQuery,
} from 'rakkasjs';
import { loadEntityData, updateItem } from 'src/db/load-entity-data';
import { MyForm, widgets } from 'src/json-schema-form';
import { compactStringify } from 'src/utils/compact-stringify';

const flattenJson = (schema: JSONSchema6, data?: Record<string, any>) => {
  const newData: Record<string, any> = {};

  const properties = Object.entries(schema.properties ?? []);

  for (const [propName, propOptions] of properties) {
    const isJson = propOptions['ui:widget'] === 'json';

    if (isJson) {
      newData[propName] = JSON.stringify(data?.[propName], undefined, 2);
    } else {
      newData[propName] = data?.[propName];
    }
  }

  return newData;
};

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

  const schema: JSONSchema6 = data?.schema ?? {};

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
            <a>{id}</a>
          </li>
        </ul>
      </div>

      <div className="card card-bordered card-compact shadow">
        <div className="card-body">
          <h2 className="card-title">Data</h2>
          <pre className="whitespace-pre-wrap">
            {compactStringify(data?.entity)}
          </pre>
        </div>
      </div>
      <div className="card card-bordered card-compact shadow">
        <div className="card-body">
          <h2 className="card-title">Edit</h2>
          <MyForm
            schema={schema}
            uiSchema={{
              ...uiSchema,
              'ui:submitButtonOptions': {
                submitText: 'Save',
              },
            }}
            formData={flattenJson(schema, data?.entity)}
            widgets={widgets}
            onSubmit={async (data) => {
              const formData = data.formData;
              console.log(formData);
              await mutation.mutateAsync({ data: formData });
            }}
            validator={validator}
          />
        </div>
      </div>
    </div>
  );
};

export default DetailPage;
