import type { ReactNode } from 'react';

// border border-base-300 bg-base-100

export const Details = (props: {
	summary?: ReactNode;
	children?: ReactNode;
}) => (
	<div className="collapse collapse-arrow rounded-box shadow border border-base-300">
		<input type="checkbox" />
		<div className="collapse-title text-xl font-medium">{props.summary}</div>
		<div className="collapse-content">{props.children}</div>
	</div>

	// <details className="border p-2 shadow rounded">
	//   <summary>{props.summary}</summary>
	//   {props.children}
	// </details>
);
