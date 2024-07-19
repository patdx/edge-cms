import {
	Link,
	Links,
	Meta,
	type MetaFunction,
	Outlet,
	Scripts,
	ScrollRestoration,
	useLoaderData,
	useRouteError,
} from '@remix-run/react';
import './tailwind.css';
import {
	type LinksFunction,
	json,
	unstable_defineLoader,
} from '@remix-run/cloudflare';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorPage } from '~/components/error-page';
import { IconMenu, IconX } from '~/components/icons';
import { StyledLink } from '~/components/styled-link';
import { SYSTEM_TABLES } from '~/db/migrator/shared';
import { getOrm } from '~/db/orm';
import { useSidebar } from '~/shared/sidebar';
import { wrapServerQuery } from '~/utils/wrap-server-query';

const queryClient = new QueryClient();

export const meta: MetaFunction = () => {
	return [{ title: 'Edge CMS' }];
};

export const links: LinksFunction = () => [
	{
		rel: 'apple-touch-icon',
		sizes: '180x180',
		href: '/apple-touch-icon.png',
	},
	{
		rel: 'icon',
		type: 'image/png',
		sizes: '32x32',
		href: '/favicon-32x32.png',
	},
	{
		rel: 'icon',
		type: 'image/png',
		sizes: '16x16',
		href: '/favicon-16x16.png',
	},
	{
		rel: 'manifest',
		href: '/site.webmanifest',
	},
];

export function Layout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en">
			<head>
				<meta charSet="utf-8" />
				<meta name="viewport" content="width=device-width, initial-scale=1" />
				<Meta />
				<Links />
			</head>
			<body>
				<QueryClientProvider client={queryClient}>
					{children}
				</QueryClientProvider>
				<ScrollRestoration />
				<Scripts />
			</body>
		</html>
	);
}

export const loader = unstable_defineLoader(async ({ context }) => {
	const result = await wrapServerQuery(async () => {
		const DB = getOrm(context).DB;
		const tables = await DB.prepare(
			`SELECT name FROM sqlite_schema WHERE type = 'table' AND name NOT IN (${SYSTEM_TABLES.map(
				(name) => `'${name}'`,
			).join(', ')}) ORDER BY name`,
		).all<{ name: string }>();
		return tables.results?.map((table) => table.name) ?? [];
	});

	return json({ sidebarData: result });
});

export default function App() {
	const data = useLoaderData<typeof loader>();

	return (
		<>
			<header className="navbar bg-base-300 sticky top-0 shadow z-10 sm:z-40">
				{/* <div className="hidden sm:block sm:w-64" /> */}
				<div className="flex-none sm:hidden">
					<button
						type="button"
						className="btn btn-square btn-ghost"
						onClick={useSidebar.getState().open}
					>
						<IconMenu />
					</button>
				</div>
				{/* <Link /> is like <a /> but it provides client-side navigation without full page reload. */}
				<Link to="/" className="btn btn-ghost normal-case text-xl">
					Edge CMS
				</Link>
			</header>

			<Sidebar data={data.sidebarData} />
			<div className="sm:pl-64">
				<Outlet />
			</div>
		</>
	);
}

export function ErrorBoundary() {
	const error = useRouteError();

	return <ErrorPage error={error} />;
}

const Sidebar = ({ data }: { data: any }) => {
	const isOpen = useSidebar((s) => s.isOpen);

	// if (data.status === 'rejected') {
	//   return <ErrorPage error={data.reason} resetErrorBoundary={() => {}} />;
	// }

	const tables = data.status === 'fulfilled' ? data.value : [];
	// if (!isOpen) return null;

	return (
		<>
			<button
				type="button"
				className={clsx(
					'fixed inset-0 bg-black z-20 transition sm:hidden',
					isOpen ? 'opacity-30' : 'opacity-0 pointer-events-none touch-none',
				)}
				onClick={useSidebar.getState().close}
			/>
			<div
				className={clsx(
					'fixed left-0 top-0 bottom-0 w-64 bg-gray-100 shadow z-30 transition sm:transition-none sm:translate-x-0 sm:opacity-100',
					isOpen
						? 'opacity-100 translate-x-0'
						: 'opacity-0 pointer-events-none sm:pointer-events-auto touch-none sm:touch-auto -translate-x-64',
				)}
			>
				<div className="navbar">
					<div className="flex-none sm:hidden">
						<button
							type="button"
							className="btn btn-square btn-ghost"
							onClick={useSidebar.getState().close}
						>
							<IconX />
						</button>
					</div>
				</div>

				<div className="p-2 flex flex-col gap-2">
					<StyledLink
						to="/database"
						className="btn btn-ghost w-full"
						activeClass="bg-[#ddd]"
					>
						Database
					</StyledLink>

					{tables.map((name) => (
						<StyledLink
							key={name}
							to={`/${name}`}
							className="btn btn-ghost w-full"
							activeClass="bg-[#ddd]"
							onClick={useSidebar.getState().close}
						>
							{name}
						</StyledLink>
					))}
				</div>
			</div>
		</>
	);
};
