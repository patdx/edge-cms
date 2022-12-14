// This is the main layout of our app. It renders the header and the footer.

import { Head, Link, StyledLink, Layout, useServerSideQuery } from "rakkasjs";
import { ENTITY_MAP } from "src/db";

import "tailwindcss/tailwind.css";

const MainLayout: Layout = ({ children }) => {
  const { data } = useServerSideQuery(() => Object.keys(ENTITY_MAP));

  return (
    <>
      {/* Rakkas relies on react-helmet-async for managing the document head */}
      {/* See their documentation: https://github.com/staylor/react-helmet-async#readme */}
      <Head title="Rakkas Demo App" />

      <header className="flex p-2 gap-2 shadow justify-between items-center bg-gray-200">
        {/* <Link /> is like <a /> but it provides client-side navigation without full page reload. */}
        <Link href="/">Rakkas Demo App</Link>

        <nav>
          <ul className="flex gap-2 items-center">
            <li>
              {/* <StyledLink /> is like <Link /> but it can be styled based on the current route ()which is useful for navigation links). */}
              <StyledLink href="/" activeClass="bg-[#ddd]">
                Home
              </StyledLink>
            </li>

            {data.map((name) => (
              <li key={name}>
                <StyledLink href={`/${name}`} activeClass="bg-[#ddd]">
                  {name}
                </StyledLink>
              </li>
            ))}
          </ul>
        </nav>
      </header>

      {children}
    </>
  );
};

export default MainLayout;
