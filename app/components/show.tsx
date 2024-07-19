import type { FC, ReactNode } from 'react';

export const Show: FC<{
	when?: any;
	fallback?: ReactNode;
	children?: ReactNode;
}> = ({ when, fallback, children }) => {
	if (when) {
		return children as any;
	} else {
		return fallback;
	}
};
