import clsx from 'clsx';
import { Link, PageProps, useServerSideQuery } from 'rakkasjs';
import { ViewEntity } from 'src/components/view-entity';
import { loadEntityData } from 'src/db/load-entity-data';
import { useDeleteMutation } from 'src/db/use-delete-mutation';

const DetailPage = ({ params }: PageProps) => {
  const entityName = params.entity;
  const id = params.id;

  const { data, refetch } = useServerSideQuery(
    (context) => loadEntityData({ context, entityName, byId: id }),
    {
      key: `${entityName}-by-id-${id}`,
    }
  );

  const deleteMutation = useDeleteMutation();

  const readOnly = data?.readOnly;

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
        </ul>
      </div>

      <div className="flex gap-2">
        <Link
          href={readOnly ? undefined : `/${entityName}/${id}/edit`}
          className={clsx('btn btn-primary', readOnly && 'btn-disabled')}
        >
          {readOnly ? 'Edit (This item is not editable)' : 'Edit'}
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

      <div className="flex flex-col gap-2 p-2">
        <ViewEntity data={data?.entity} schema={data?.schema} />
      </div>
      {/* <div className="card card-bordered card-compact shadow">
        <div className="card-body">
          <h2 className="card-title">Data</h2>
          <ViewEntity data={data?.entity} schema={data?.schema} />
        </div>
      </div> */}
    </div>
  );
};

export default DetailPage;