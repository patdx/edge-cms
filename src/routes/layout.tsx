// This is the main layout of our app. It renders the header and the footer.

import { Head, Layout, Link, StyledLink, useServerSideQuery } from 'rakkasjs';

import { SYSTEM_TABLES } from 'src/db/migrator/shared';
import { getOrm } from 'src/db/orm';
import 'tailwindcss/tailwind.css';

const MainLayout: Layout = ({ children }) => {
  const { data } = useServerSideQuery(
    async (context) => {
      const DB = getOrm(context).DB;
      const tables = await DB.prepare(
        `SELECT name FROM sqlite_schema WHERE type = 'table' AND name NOT IN (${SYSTEM_TABLES.map(
          (name) => `'${name}'`
        ).join(', ')}) ORDER BY name`
      ).all<{ name: string }>();
      return tables.results?.map((table) => table.name) ?? [];
    },
    { key: 'available-entities' }
  );

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

      <header className="flex p-2 gap-2 shadow items-center bg-gray-200 flex-wrap">
        {/* <Link /> is like <a /> but it provides client-side navigation without full page reload. */}
        <Link href="/">Edge CMS</Link>

        <div className="hidden sm:block flex-1"></div>

        <StyledLink href="/database" activeClass="bg-[#ddd]">
          Database
        </StyledLink>

        {data.map((name) => (
          <StyledLink
            key={name}
            href={`/${name}`}
            className="capitalize"
            activeClass="bg-[#ddd]"
          >
            {name}
          </StyledLink>
        ))}
      </header>

      {children}
    </>
  );
};

export default MainLayout;
