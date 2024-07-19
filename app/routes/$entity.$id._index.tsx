import { json } from '@remix-run/react';
import clsx from 'clsx';
import { loadEntityData } from '~/db/load-entity-data';
import { useDeleteMutation } from '~/db/use-delete-mutation';
import { wrapServerQuery } from '~/utils/wrap-server-query';

export const loader = defineLoader(async ({ context, params }) => {
	console.log('params', params);
	const entityName = params.entity!;
	const id = params.id;
	const result = await wrapServerQuery(async () =>
		loadEntityData({ context, entityName, byId: id }),
	);

	return json(result);
}); // key: `${entityName}-by-id-${id}`,

const DetailPage = () => {
	const params = useParams();
	const entityName = params.entity;
	const id = params.id;

	const data = useLoaderData<typeof loader>();

	const deleteMutation = useDeleteMutation();

	if (data.status === 'rejected') {
		return <ErrorPage error={data.reason} resetErrorBoundary={() => {}} />;
	}

	const result = data.value;

	const readOnly = result?.readOnly;

	return (
		<div className="p-2 flex flex-col gap-2">
			<div className="text-sm breadcrumbs">
				<ul>
					<li>
						<Link to={`/${entityName}`}>{entityName}</Link>
					</li>
					<li>
						<Link to={`/${entityName}/${id}`}>{id}</Link>
					</li>
				</ul>
			</div>

			<div className="flex gap-2">
				<Link
					to={readOnly ? '#' : `/${entityName}/${id}/edit`}
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
				<ViewEntity data={result?.entity} schema={result?.schema} />
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
