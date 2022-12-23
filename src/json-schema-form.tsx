import type { RegistryWidgetsType, WidgetProps } from "@rjsf/utils";
import dirtyJSON from "dirty-json";
import { useRef } from "react";
import { ErrorBoundary } from "react-error-boundary";
import Form from "@rjsf/semantic-ui";
import validator from "@rjsf/validator-ajv8";
import type { FormProps } from "@rjsf/core";
import type { JSONSchema6 } from "json-schema";
import { Details } from "./components/details";

const tryParseJson = (maybeJson?: string): JSONSchema6 => {
  if (typeof maybeJson !== "string") {
    return {};
  }
  try {
    return dirtyJSON.parse(maybeJson);
  } catch (err) {
    return {};
  }
};

const tryFormatJson = (maybeJson?: string): string => {
  if (typeof maybeJson !== "string") {
    return "";
  }
  try {
    return JSON.stringify(JSON.parse(maybeJson), undefined, 2);
  } catch (err) {
    return maybeJson;
  }
};

const tryCompactJson = (maybeJson?: string): string => {
  if (typeof maybeJson !== "string") {
    return "";
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

  return (
    <div className="flex flex-col gap-2">
      <textarea
        ref={textAreaRef}
        id={props.id}
        rows={10}
        onChange={(event) => props.onChange(tryCompactJson(event.target.value))}
        onBlur={(event) => (event.target.value = defaultValue)}
        defaultValue={defaultValue}
      />
      <Details summary="JSON Preview">
        <pre className="whitespace-pre-wrap p-4 text-sm">
          {tryFormatJson(props.value)}
        </pre>
      </Details>

      <Details summary="Form Preview">
        <ErrorBoundary
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
};

export const MyForm = (props: FormProps) => (
  <Form schema={props.schema} validator={validator} widgets={widgets}></Form>
);
