import type { ReactNode } from 'react';

export function For<T extends readonly any[], U extends ReactNode>(props: {
	each: T | undefined | null | false;
	fallback?: ReactNode;
	as: (item: T[number], index: number) => U;
}): JSX.Element {
	if (!Array.isArray(props.each)) {
		return <>{props.fallback}</>;
	}

	const length = props.each.length;

	if (length === 0) {
		return <>{props.fallback}</>;
	}

	return <>{props.each.map(props.as)}</>;
}
