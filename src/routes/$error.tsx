import type { FallbackProps } from 'rakkasjs';
import { flattenError } from 'src/utils/wrap-server-query';

export default function ErrorPage(props: FallbackProps) {
	// const message =
	//   typeof props.error?.stack === 'string'
	//     ? props.error.stack
	//     : typeof props.error?.message === 'string'
	//     ? props.error.message
	//     : typeof props.error === 'string'
	//     ? props.error
	//     : undefined;

	// const cause = (props.error as any)?.cause as Error;

	const lines = flattenError(props.error);

	return (
		<>
			<p className="p-2">Error</p>
			{lines.map((line, index) => (
				<pre
					key={index}
					className="whitespace-pre-wrap p-2 transition hover:bg-gray-200 active:bg-gray-200"
				>
					{line}
				</pre>
			))}
			<p className="p-2">
				<button
					className="btn btn-primary"
					type="button"
					onClick={() => location.reload()}
				>
					Retry
				</button>
			</p>
		</>
	);
}
