import validator from '@rjsf/validator-ajv8';
import {
  Link,
  PageProps,
  useServerSideMutation,
  useServerSideQuery,
} from 'rakkasjs';
import { Details } from 'src/components/details';
import { insertItem, loadEntityData } from 'src/db/load-entity-data';
import { MyForm } from 'src/json-schema-form';
import { compactStringify } from 'src/utils/compact-stringify';

const EntityPage = ({ params }: PageProps) => {
  const entityName = params.entity;

  // TODO: figure out how to filter out default urls like favicon.ico
  // more effectively to avoid error messagesq

  const { data, refetch } = useServerSideQuery((context) =>
    loadEntityData({ context, entityName, withEntities: true })
  );

  const { entities, ...remaining } = data ?? {};

  const schema = data?.schema;

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
        </ul>
      </div>

      {/* <Details summary="JSON Schema">
        <pre>{compactStringify(schema)}</pre>
      </Details> */}

      <div className="flex gap-2">
        <Link href={`/${entityName}/create`} className="btn btn-primary">
          Create
        </Link>

        <Link href={`/_schemas`} className="btn  btn-outline btn-secondary">
          Schema
        </Link>
      </div>

      {entities?.map((entity) => (
        <Link
          key={entity.id}
          href={`/${entityName}/${entity.id}`}
          className="card card-bordered card-compact shadow"
        >
          <div className="card-body whitespace-pre-wrap hover:opacity-75">
            {compactStringify(entity)}
          </div>
        </Link>
      ))}
    </div>
  );
};

export default EntityPage;
