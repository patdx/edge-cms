import { json } from '@remix-run/react';
import validator from '@rjsf/validator-ajv8';
import { loadEntityData } from '~/db/load-entity-data';
import { MyForm } from '~/json-schema-form';
import { compactStringify } from '~/utils/compact-stringify';

export const loader = defineLoader(async ({ params, context }) => {
	const { entity: entityName } = z.object({ entity: z.string() }).parse(params);

	const result = await loadEntityData({ context, entityName });

	return json(result);
});

const CreatePage = () => {
	const params = useParams();
	const entityName = params.entity;

	// TODO: figure out how to filter out default urls like favicon.ico
	// more effectively to avoid error messagesq

	const data = useLoaderData<typeof loader>();

	const revalidator = useRevalidator();
	const navigate = useNavigate();

	// const queryClient = useQueryClient();

	const mutation = useMutation({
		mutationFn: honoClient.insertItem.$post,
		async onSuccess(response) {
			const { id } = await response.json();
			navigate(`/${entityName}/${id}`);
		},
		onError(error) {
			console.error(error);
			revalidator.revalidate();
		},
	});

	const schema = data?.schema;

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
					<li>Create</li>
				</ul>
			</div>

			<Details summary="JSON Schema">
				<pre>{compactStringify(schema)}</pre>
			</Details>

			<div className="card card-bordered card-compact shadow">
				<div className="card-body">
					<h2 className="card-title">Create</h2>
					<Show
						when={schema}
						fallback={
							<div>
								Could not find the schema for this table. Please make sure to
								sync the database to the latest schema first.
							</div>
						}
					>
						{' '}
						<MyForm
							schema={schema as any}
							onSubmit={async (data) => {
								const formData = data.formData;
								console.log(formData);
								await mutation.mutateAsync({
									json: {
										entityName: entityName!,
										data: formData,
									},
								});
							}}
							uiSchema={{
								...uiSchema,
								'ui:submitButtonOptions': {
									submitText: 'Create',
								},
							}}
							validator={validator}
						/>
					</Show>
				</div>
			</div>
		</div>
	);
};

export default CreatePage;
