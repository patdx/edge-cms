import clsx from 'clsx';
import type { JSONSchema6 } from 'json-schema';
import type { FC } from 'react';
import { compactStringify } from '../utils/compact-stringify';
import { For } from 'src/components/for';

export const ViewEntity: FC<{
  data: any;
  schema: JSONSchema6;
  type?: 'json' | 'pretty';
}> = ({ data, schema, type }) => {
  const properties = Object.entries(schema.properties ?? {}).map(
    ([key, value]) => ({
      key,
      value,
    })
  );

  if (type === 'json') {
    return <pre className="whitespace-pre-wrap">{compactStringify(data)}</pre>;
  } else {
    return (
      <For
        each={properties}
        as={({ key, value }) => (
          <Property
            key={key}
            name={key}
            schema={value as JSONSchema6}
            value={data?.[key]}
          />
        )}
      />
    );
  }
};

const Property: FC<{
  name: string;
  schema: JSONSchema6;
  value: any;
}> = ({ name, schema, ...props }) => {
  const type = schema.type;

  let value: any;
  let showWhiteSpace: boolean;

  if (['string', 'number'].includes(typeof props.value)) {
    value = props.value;
    showWhiteSpace = schema['ui:widget'] === 'textarea';
  } else {
    value = compactStringify(props.value);
    showWhiteSpace = true;
  }

  return (
    <div>
      <div className={clsx('font-bold')}>{name}</div>
      <div className={clsx(showWhiteSpace && 'whitespace-pre-wrap')}>
        {value}
      </div>
    </div>
  );
};
