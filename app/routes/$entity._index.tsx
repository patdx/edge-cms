import { Show } from '~/components/show';
import { loadEntityData } from '~/db/load-entity-data';
import { wrapServerQuery } from '~/utils/wrap-server-query';
import { ViewEntity } from '~/components/view-entity';
import { For } from '~/components/for';
import { unstable_defineLoader } from '@remix-run/cloudflare';
import { Link, useLoaderData, useParams } from '@remix-run/react';

export const loader = unstable_defineLoader(async ({ context, params }) => {
  const entityName = params.entity as string;
  return wrapServerQuery(() =>
    loadEntityData({ context, entityName, withEntities: true }),
  );
});

const EntityPage = () => {
  const params = useParams();
  const entityName = params.entity;

  const data = useLoaderData<typeof loader>(); //       key: `view-all-${entityName}`,

  // TODO: figure out how to filter out default urls like favicon.ico
  // more effectively to avoid error messagesq

  const results = data.status === 'fulfilled' ? data.value : undefined;

  const { entities, schema, schemaId } = results ?? {};

  return (
    <div className="p-2 flex flex-col gap-2">
      <div className="text-sm breadcrumbs">
        <ul>
          <li>
            <Link to={`/${entityName}`}>{entityName}</Link>
          </li>
        </ul>
      </div>

      {/* <Details summary="JSON Schema">
        <pre>{compactStringify(schema)}</pre>
      </Details> */}

      <div className="flex gap-2">
        <Link to={`/${entityName}/create`} className="btn btn-primary">
          Create
        </Link>

        <Link
          // TODO: allow linking by the actual schema id instead of the database table id
          // entityName
          // Probably need to support different primary key schemes or something first
          to={`/_schemas/${encodeURIComponent(schemaId)}`}
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
                to={`/${entityName}/${row.id}`}
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
