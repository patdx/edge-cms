import type { FormProps } from '@rjsf/core';
import {
  FieldTemplateProps,
  FormContextType,
  getInputProps,
  getSubmitButtonOptions,
  getTemplate,
  getUiOptions,
  RegistryWidgetsType,
  RJSFSchema,
  StrictRJSFSchema,
  SubmitButtonProps,
  WidgetProps,
} from '@rjsf/utils';
import validator from '@rjsf/validator-ajv8';
import dirtyJSON from 'dirty-json';
import type { JSONSchema6 } from 'json-schema';
import { useRef, useCallback, forwardRef, useState, FocusEvent } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { Details } from './components/details';
import { ThemeProps, withTheme } from '@rjsf/core';
import clsx from 'clsx';
import MonacoEditor from '@monaco-editor/react';
import jsonSchemaDraft7 from './json-schema-draft-7.json'; // https://github.com/json-schema-org/json-schema-spec/issues/1007

const tryParseJson = (maybeJson?: string): JSONSchema6 | undefined => {
  try {
    return dirtyJSON.parse(maybeJson);
  } catch (err) {
    return undefined;
  }
};

const tryFormatJson = (maybeJson?: string): string => {
  if (typeof maybeJson !== 'string') {
    return '';
  }
  try {
    return JSON.stringify(JSON.parse(maybeJson), undefined, 2);
  } catch (err) {
    return maybeJson;
  }
};

const tryCompactJson = (maybeJson?: string): string => {
  if (typeof maybeJson !== 'string') {
    return '';
  }
  try {
    return JSON.stringify(dirtyJSON.parse(maybeJson));
  } catch (err) {
    return maybeJson;
  }
};

const JsonTextEdit = function (props: WidgetProps) {
  let defaultValue = tryFormatJson(props.value);

  // const lines = Math.max(value.split("\n").length, 5);

  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  const [useMonaco, setUseMonaco] = useState(false);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex-none">
        <div className="btn btn-xs" onClick={() => setUseMonaco(!useMonaco)}>
          Toggle editor
        </div>
      </div>
      {useMonaco ? (
        <MonacoEditor
          height="50vh"
          width="100%"
          language="json"
          wrapperProps={{ className: 'rounded border p-2' }}
          options={{
            tabSize: 2,
          }}
          beforeMount={(monaco) => {
            monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
              validate: true,
              schemas: [
                {
                  uri: 'https://json-schema.org/draft/2019-09/schema',
                  fileMatch: ['*'],
                  schema: jsonSchemaDraft7,
                },
              ],
            });
          }}
          onChange={(value) => props.onChange(tryCompactJson(value))}
          defaultValue={props.value}
        />
      ) : (
        <textarea
          className="textarea textarea-bordered"
          ref={textAreaRef}
          id={props.id}
          rows={10}
          onChange={(event) =>
            props.onChange(tryCompactJson(event.target.value))
          }
          onBlur={(event) => (event.target.value = defaultValue)}
          defaultValue={defaultValue}
        />
      )}

      <Details summary="JSON Preview">
        <pre className="whitespace-pre-wrap p-4 text-sm">
          {tryFormatJson(props.value)}
        </pre>
      </Details>

      <Details summary="Form Preview">
        <ErrorBoundary
          key={props.value}
          fallbackRender={(props) => <p>Error: {String(props.error)}</p>}
        >
          <MyForm schema={tryParseJson(props.value)} />
        </ErrorBoundary>
      </Details>
    </div>
  );
};

export const widgets: RegistryWidgetsType = {
  json: JsonTextEdit,
  TextareaWidget,
};

function BaseInputTemplate<
  T = any,
  S extends StrictRJSFSchema = RJSFSchema,
  F extends FormContextType = any
>(props: WidgetProps<T, S, F>) {
  const {
    id,
    value,
    readonly,
    disabled,
    autofocus,
    onBlur,
    onFocus,
    onChange,
    options,
    schema,
    uiSchema,
    formContext,
    registry,
    rawErrors,
    type,
    ...rest
  } = props;

  // Note: since React 15.2.0 we can't forward unknown element attributes, so we
  // exclude the "options" and "schema" ones here.
  if (!id) {
    console.log('No id for', props);
    throw new Error(`no id for props ${JSON.stringify(props)}`);
  }
  const inputProps = {
    ...rest,
    ...getInputProps<T, S, F>(schema, type, options),
  };

  let inputValue;
  if (inputProps.type === 'number' || inputProps.type === 'integer') {
    inputValue = value || value === 0 ? value : '';
  } else {
    inputValue = value == null ? '' : value;
  }

  const _onChange = useCallback(
    ({ target: { value } }: React.ChangeEvent<HTMLInputElement>) =>
      onChange(value === '' ? options.emptyValue : value),
    [onChange, options]
  );
  const _onBlur = useCallback(
    ({ target: { value } }: React.FocusEvent<HTMLInputElement>) =>
      onBlur(id, value),
    [onBlur, id]
  );
  const _onFocus = useCallback(
    ({ target: { value } }: React.FocusEvent<HTMLInputElement>) =>
      onFocus(id, value),
    [onFocus, id]
  );

  return (
    <>
      <input
        id={id}
        name={id}
        className="input input-bordered w-full max-w-xs block"
        readOnly={readonly}
        disabled={disabled}
        autoFocus={autofocus}
        value={inputValue}
        {...inputProps}
        list={schema.examples ? `examples_${id}` : undefined}
        onChange={_onChange}
        onBlur={_onBlur}
        onFocus={_onFocus}
      />
      {Array.isArray(schema.examples) && (
        <datalist key={`datalist_${id}`} id={`examples_${id}`}>
          {[
            ...new Set(
              schema.examples.concat(schema.default ? [schema.default] : [])
            ),
          ].map((example: any) => (
            <option key={example} value={example} />
          ))}
        </datalist>
      )}
    </>
  );
}

/** The `TextareaWidget` is a widget for rendering input fields as textarea.
 *
 * @param props - The `WidgetProps` for this component
 */
function TextareaWidget<
  T = any,
  S extends StrictRJSFSchema = RJSFSchema,
  F extends FormContextType = any
>({
  id,
  options = {},
  placeholder,
  value,
  required,
  disabled,
  readonly,
  autofocus = false,
  onChange,
  onBlur,
  onFocus,
}: WidgetProps<T, S, F>) {
  const handleChange = useCallback(
    ({ target: { value } }: React.ChangeEvent<HTMLTextAreaElement>) =>
      onChange(value === '' ? options.emptyValue : value),
    [onChange, options.emptyValue]
  );

  const handleBlur = useCallback(
    ({ target: { value } }: FocusEvent<HTMLTextAreaElement>) =>
      onBlur(id, value),
    [onBlur, id]
  );

  const handleFocus = useCallback(
    ({ target: { value } }: FocusEvent<HTMLTextAreaElement>) =>
      onFocus(id, value),
    [id, onFocus]
  );

  return (
    <textarea
      id={id}
      name={id}
      className="textarea textarea-bordered"
      value={value ? value : ''}
      placeholder={placeholder}
      required={required}
      disabled={disabled}
      readOnly={readonly}
      autoFocus={autofocus}
      rows={options.rows}
      onBlur={handleBlur}
      onFocus={handleFocus}
      onChange={handleChange}
    />
  );
}

TextareaWidget.defaultProps = {
  autofocus: false,
  options: {},
};

const REQUIRED_FIELD_SYMBOL = '*';

type LabelProps = {
  /** The label for the field */
  label?: string;
  /** A boolean value stating if the field is required */
  required?: boolean;
  /** The id of the input field being labeled */
  id?: string;
};

/** Renders a label for a field
 *
 * @param props - The `LabelProps` for this component
 */
function Label(props: LabelProps) {
  const { label, required, id } = props;
  if (!label) {
    return null;
  }
  return (
    <label className="label" htmlFor={id}>
      <span className="label-text">
        {label}
        {required && <span className="required">{REQUIRED_FIELD_SYMBOL}</span>}
      </span>
    </label>
  );
}

function FieldTemplate<
  T = any,
  S extends StrictRJSFSchema = RJSFSchema,
  F extends FormContextType = any
>(props: FieldTemplateProps<T, S, F>) {
  const {
    id,
    label,
    children,
    errors,
    help,
    description,
    hidden,
    required,
    displayLabel,
    registry,
    uiSchema,
  } = props;
  const uiOptions = getUiOptions(uiSchema);
  const WrapIfAdditionalTemplate = getTemplate<
    'WrapIfAdditionalTemplate',
    T,
    S,
    F
  >('WrapIfAdditionalTemplate', registry, uiOptions);
  if (hidden) {
    return <div className="hidden">{children}</div>;
  }
  return (
    <WrapIfAdditionalTemplate {...props}>
      <div className="form-control">
        {displayLabel && <Label label={label} required={required} id={id} />}
        {displayLabel && description ? description : null}
        {children}
        {errors}
        {help}
      </div>
    </WrapIfAdditionalTemplate>
  );
}

function SubmitButton<
  T = any,
  S extends StrictRJSFSchema = RJSFSchema,
  F extends FormContextType = any
>({ uiSchema }: SubmitButtonProps<T, S, F>) {
  const {
    submitText,
    norender,
    props: submitButtonProps = {},
  } = getSubmitButtonOptions<T, S, F>(uiSchema);
  if (norender) {
    return null;
  }
  return (
    <div className="mt-4">
      <button
        type="submit"
        {...submitButtonProps}
        className={clsx('btn btn-info', submitButtonProps.className)}
      >
        {submitText}
      </button>
    </div>
  );
}

const theme: ThemeProps = {
  widgets,
  templates: {
    BaseInputTemplate,
    FieldTemplate,
    ButtonTemplates: {
      SubmitButton,
    },
  },
  // _internalFormWrapper: forwardRef(({ children, as }, ref) => {
  //   const FormTag = as || 'form';
  //   return (
  //     <FormTag className="flex flex-col gap-4" ref={ref}>
  //       {children}
  //     </FormTag>
  //   );
  // }),
};

const InternalDaisyForm = withTheme(theme);

export const MyForm = (props: FormProps) => {
  if (!props.schema) return null;
  return <InternalDaisyForm validator={validator} {...(props as any)} />;
};
