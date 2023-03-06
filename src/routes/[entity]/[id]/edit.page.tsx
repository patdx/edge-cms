import validator from '@rjsf/validator-ajv8';
import {
  Link,
  navigate,
  PageProps,
  useQueryClient,
  useServerSideMutation,
  useServerSideQuery,
} from 'rakkasjs';
import { Show } from 'src/components/show';
import { loadEntityData, updateItem } from 'src/db/load-entity-data';
import { useDeleteMutation } from 'src/db/use-delete-mutation';
import { MyForm } from 'src/json-schema-form';
import ErrorPage from 'src/routes/$error';
import { flattenJson } from 'src/utils/flatten-json';
import { wrapServerQuery } from 'src/utils/wrap-server-query';

const EditPage = ({ params }: PageProps) => {
  const entityName = params.entity;
  const id = params.id;

  const { data, refetch } = useServerSideQuery(
    (context) =>
      wrapServerQuery(() => loadEntityData({ context, entityName, byId: id })),
    {
      key: `${entityName}-by-id-${id}`,
    }
  );

  const queryClient = useQueryClient();

  const editMutation = useServerSideMutation<
    { newId: string | number },
    {
      data: any;
    }
  >(
    async (context, vars) => {
      const { newId } = await updateItem({
        context,
        entityName,
        id,
        data: vars.data,
      });

      return { newId };
    },
    {
      onSettled() {
        // refetch();
        queryClient.invalidateQueries(`view-all-${entityName}`);
        queryClient.invalidateQueries(`${entityName}-by-id-${id}`);
      },
      onSuccess(data) {
        navigate(`/${entityName}/${data.newId}`);
      },
    }
  );

  const deleteMutation = useDeleteMutation();

  if (data.status === 'rejected') {
    return <ErrorPage error={data.reason} resetErrorBoundary={() => {}} />;
  }

  const result = data.value;

  const schema = result?.schema;

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

        <button
          type="button"
          className="btn btn-warning"
          onClick={() =>
            deleteMutation.mutateAsync({
              entityName,
              id,
            })
          }
        >
          Delete
        </button>
      </div>

      <Show
        when={result.readOnly === false}
        fallback={
          <div className="p-4">
            This item is read only and cannot be edited.
          </div>
        }
      >
        <div className="p-2">
          <MyForm
            schema={schema as any}
            uiSchema={{
              ...uiSchema,
              'ui:submitButtonOptions': {
                submitText: 'Save',
              },
            }}
            formData={flattenJson(schema, result?.entity)}
            onSubmit={async (data) => {
              const formData = data.formData;
              console.log(formData);
              await editMutation.mutateAsync({ data: formData });
            }}
            validator={validator}
          />
        </div>
      </Show>
    </div>
  );
};

export default EditPage;
