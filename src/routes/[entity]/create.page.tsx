import validator from '@rjsf/validator-ajv8';
import {
	Link,
	navigate,
	type PageProps,
	useQueryClient,
	useServerSideMutation,
	useServerSideQuery,
} from 'rakkasjs';
import { Details } from 'src/components/details';
import { Show } from 'src/components/show';
import { insertItem, loadEntityData } from 'src/db/load-entity-data';
import { MyForm } from 'src/json-schema-form';
import { compactStringify } from 'src/utils/compact-stringify';

const CreatePage = ({ params }: PageProps) => {
	const entityName = params.entity;

	// TODO: figure out how to filter out default urls like favicon.ico
	// more effectively to avoid error messagesq

	const { data, refetch } = useServerSideQuery((context) =>
		loadEntityData({ context, entityName }),
	);

	const queryClient = useQueryClient();

	const mutation = useServerSideMutation<
		{ id: string | number },
		{
			data: any;
		}
	>(
		async (context, vars) => {
			const { id } = await insertItem(context, entityName, vars.data);

			return { id };
		},
		{
			onSettled() {
				queryClient.invalidateQueries(`view-all-${entityName}`);
				// refetch();
			},
			onSuccess(data) {
				navigate(`/${entityName}/${data.id}`);
			},
		},
	);

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
						<Link href={`/${entityName}`}>{entityName}</Link>
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
					</Show>
				</div>
			</div>
		</div>
	);
};

export default CreatePage;
