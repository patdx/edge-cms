import { Link, useServerSideQuery, type PageProps } from 'rakkasjs';
import { Show } from 'src/components/show';
import { loadEntityData } from 'src/db/load-entity-data';
import { wrapServerQuery } from 'src/utils/wrap-server-query';
import { ViewEntity } from '../../components/view-entity';
import { For } from 'src/components/for';

const EntityPage = ({ params }: PageProps) => {
	console.log('EntityPage');
	const entityName = params.entity;

	// TODO: figure out how to filter out default urls like favicon.ico
	// more effectively to avoid error messagesq

	const { data, refetch } = useServerSideQuery(
		(context) =>
			wrapServerQuery(() =>
				loadEntityData({ context, entityName, withEntities: true }),
			),
		{
			key: `view-all-${entityName}`,
		},
	);

	const results = data.status === 'fulfilled' ? data.value : undefined;

	const { entities, schema, schemaId } = results ?? {};

	return (
		<div className="p-2 flex flex-col gap-2">
			<div className="text-sm breadcrumbs">
				<ul>
					<li>
						<Link href={`/${entityName}`}>{entityName}</Link>
					</li>
				</ul>
			</div>

			{/* <Details summary="JSON Schema">
        <pre>{compactStringify(schema)}</pre>
      </Details> */}

			<div className="flex gap-2">
				<Link href={`/${entityName}/create`} className="btn btn-primary">
					Create
				</Link>

				<Link
					// TODO: allow linking by the actual schema id instead of the database table id
					// entityName
					// Probably need to support different primary key schemes or something first
					href={`/_schemas/${encodeURIComponent(schemaId)}`}
					className="btn  btn-outline btn-secondary"
				>
					Schema
				</Link>
			</div>

			<Show
				when={schema}
				fallback={
					<div>
						Could not find the schema for this table. Please make sure to sync
						the database to the latest schema first.
					</div>
				}
			>
				<For
					each={entities}
					as={(row) => {
						return (
							<Link
								key={row.id}
								href={`/${entityName}/${row.id}`}
								className="card card-bordered card-compact shadow"
							>
								<div className="card-body whitespace-pre-wrap hover:opacity-75">
									<ViewEntity data={row} schema={schema} />
								</div>
							</Link>
						);
					}}
					fallback={<div className="p-4">No items yet.</div>}
				/>
			</Show>
		</div>
	);
};

export default EntityPage;
