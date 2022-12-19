// This is the main layout of our app. It renders the header and the footer.

import { Head, Link, StyledLink, Layout, useServerSideQuery } from "rakkasjs";
import { entities } from "src/db/entities";

import "tailwindcss/tailwind.css";
import "semantic-ui-css/semantic.min.css";

const MainLayout: Layout = ({ children }) => {
  const { data } = useServerSideQuery(() => Object.keys(entities));

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

      <header className="flex p-2 gap-2 shadow justify-between items-center bg-gray-200">
        {/* <Link /> is like <a /> but it provides client-side navigation without full page reload. */}
        <Link href="/">Edge CMS</Link>

        <nav>
          <ul className="flex gap-2 items-center">
            <li>
              {/* <StyledLink /> is like <Link /> but it can be styled based on the current route ()which is useful for navigation links). */}
              <StyledLink href="/" activeClass="bg-[#ddd]">
                Home
              </StyledLink>
            </li>

            <li>
              <StyledLink href="/schema" activeClass="bg-[#ddd]">
                Schema
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
