import type { ReactNode } from "react";

export const Details = (props: {
  summary?: ReactNode;
  children?: ReactNode;
}) => (
  <details className="border p-2 shadow rounded">
    <summary>{props.summary}</summary>
    {props.children}
  </details>
);
