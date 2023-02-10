import { Link, PageProps, useServerSideQuery } from 'rakkasjs';
import { For } from 'react-loops';
import { loadEntityData } from 'src/db/load-entity-data';
import { compactStringify } from 'src/utils/compact-stringify';
import { ViewEntity } from '../../components/view-entity';

const EntityPage = ({ params }: PageProps) => {
  const entityName = params.entity;

  // TODO: figure out how to filter out default urls like favicon.ico
  // more effectively to avoid error messagesq

  const { data, refetch } = useServerSideQuery((context) =>
    loadEntityData({ context, entityName, withEntities: true })
  );

  const { entities, schema, schemaId } = data ?? {};

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
          href={`/_schemas/${encodeURIComponent(schemaId)}`}
          className="btn  btn-outline btn-secondary"
        >
          Schema
        </Link>
      </div>

      <For
        of={entities}
        as={(row) => {
          return (
            <Link
              key={row.id}
              href={`/${entityName}/${row.id}`}
              className="card card-bordered card-compact shadow"
            >
              <div className="card-body whitespace-pre-wrap hover:opacity-75">
                <ViewEntity data={row} schema={data?.schema} />
              </div>
            </Link>
          );
        }}
        ifEmpty={<div className="p-4">No items yet.</div>}
      />
    </div>
  );
};

export default EntityPage;
