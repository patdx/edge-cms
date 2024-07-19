import { NavLink } from '@remix-run/react';
import clsx from 'clsx';

export function StyledLink({
	children,
	...props
}: React.ComponentProps<typeof NavLink> & { activeClass?: string }) {
	const { activeClass, ...rest } = props;
	return (
		<NavLink
			{...rest}
			className={({ isActive }) =>
				clsx(props.className, isActive && props.activeClass)
			}
		>
			{children}
		</NavLink>
	);
}
