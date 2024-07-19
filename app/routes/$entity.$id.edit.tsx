import { json } from '@remix-run/react';
import validator from '@rjsf/validator-ajv8';
import { loadEntityData } from '~/db/load-entity-data';
import { useDeleteMutation } from '~/db/use-delete-mutation';
import { MyForm } from '~/json-schema-form';
import { flattenJson } from '~/utils/flatten-json';

export const loader = defineLoader(async ({ params, context }) => {
	const { entity: entityName, id } = z
		.object({ entity: z.string(), id: z.string() })
		.parse(params);

	const result = await loadEntityData({ context, entityName, byId: id });

	return json(result);
});

const EditPage = () => {
	const params = useParams();

	const { entity: entityName, id } = z
		.object({ entity: z.string(), id: z.string() })
		.parse(params);

	const data = useLoaderData<typeof loader>();

	const revalidator = useRevalidator();
	const navigate = useNavigate();

	const editMutation = useMutation({
		mutationFn: async (vars: { data: any }) => {
			const { newId } = await honoClient.updateItem.$post({
				json: {
					entityName,
					id,
					data: vars.data,
				},
			});
			return { newId };
		},
		onSettled() {
			revalidator.revalidate();
			// refetch();
			// queryClient.invalidateQueries(`view-all-${entityName}`);
			// queryClient.invalidateQueries(`${entityName}-by-id-${id}`);
		},
		onSuccess(data) {
			navigate(`/${entityName}/${data.newId}`);
		},
	});

	const deleteMutation = useDeleteMutation();

	// if (data.status === 'rejected') {
	// 	return <ErrorPage error={data.reason} resetErrorBoundary={() => {}} />;
	// }

	const result = data;

	const schema = result?.schema;

	// we just pass the whole thing through for now, to
	// make it easy to pass properties inside one
	// schema

	const uiSchema = schema?.properties ?? {};

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
					<li>
						<a>Edit</a>
					</li>
				</ul>
			</div>

			<div className="flex gap-2">
				<Link to={`/${entityName}/${id}`} className="btn btn-primary">
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
