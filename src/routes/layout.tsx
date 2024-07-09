import clsx from 'clsx';
import {
	Head,
	type Layout,
	Link,
	StyledLink,
	useServerSideQuery,
} from 'rakkasjs';
import { IconMenu, IconX } from 'src/components/icons';
import { SYSTEM_TABLES } from 'src/db/migrator/shared';
import { getOrm } from 'src/db/orm';
import { useSidebar } from 'src/shared/sidebar';
import { wrapServerQuery } from 'src/utils/wrap-server-query';
import 'tailwindcss/tailwind.css';

const Sidebar = () => {
	const { data } = useServerSideQuery(
		(context) =>
			wrapServerQuery(async () => {
				const DB = getOrm(context).DB;
				const tables = await DB.prepare(
					`SELECT name FROM sqlite_schema WHERE type = 'table' AND name NOT IN (${SYSTEM_TABLES.map(
						(name) => `'${name}'`,
					).join(', ')}) ORDER BY name`,
				).all<{ name: string }>();
				return tables.results?.map((table) => table.name) ?? [];
			}),
		{ key: 'available-entities' },
	);

	const isOpen = useSidebar((s) => s.isOpen);

	// if (data.status === 'rejected') {
	//   return <ErrorPage error={data.reason} resetErrorBoundary={() => {}} />;
	// }

	const tables = data.status === 'fulfilled' ? data.value : [];
	// if (!isOpen) return null;

	return (
		<>
			<div
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
							className="btn btn-square btn-ghost"
							onClick={useSidebar.getState().close}
						>
							<IconX />
						</button>
					</div>
				</div>

				<div className="p-2 flex flex-col gap-2">
					<StyledLink
						href="/database"
						className="btn btn-ghost w-full"
						activeClass="bg-[#ddd]"
					>
						Database
					</StyledLink>

					{tables.map((name) => (
						<StyledLink
							key={name}
							href={`/${name}`}
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

const MainLayout: Layout = ({ children }) => {
	return (
		<>
			{/* Rakkas relies on react-helmet-async for managing the document head */}
			{/* See their documentation: https://github.com/staylor/react-helmet-async#readme */}
			<Head title="Edge CMS" />
			<Head>
				<link
					rel="apple-touch-icon"
					sizes="180x180"
					href="/apple-touch-icon.png"
				/>
				<link
					rel="icon"
					type="image/png"
					sizes="32x32"
					href="/favicon-32x32.png"
				/>
				<link
					rel="icon"
					type="image/png"
					sizes="16x16"
					href="/favicon-16x16.png"
				/>
				<link rel="manifest" href="/site.webmanifest" />
			</Head>

			{/* flex p-2 gap-2 shadow items-center bg-gray-200 flex-wrap */}
			<header className="navbar bg-base-300 sticky top-0 shadow z-10 sm:z-40">
				{/* <div className="hidden sm:block sm:w-64" /> */}
				<div className="flex-none sm:hidden">
					<button
						className="btn btn-square btn-ghost"
						onClick={useSidebar.getState().open}
					>
						<IconMenu />
					</button>
				</div>
				{/* <Link /> is like <a /> but it provides client-side navigation without full page reload. */}
				<Link href="/" className="btn btn-ghost normal-case text-xl">
					Edge CMS
				</Link>
			</header>

			<Sidebar />
			<div className="sm:pl-64">{children}</div>
		</>
	);
};

export default MainLayout;
