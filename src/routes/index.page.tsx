import { Page } from "rakkasjs";
// import { Category, DB, getSqlite } from "src/db/typeorm";

const HomePage: Page = function HomePage() {
  // const { data } = useServerSideQuery(
  //   async () => {
  //     const categories = await DB.getRepository(Category).find();

  //     console.log(getSqlite());
  //     return [
  //       categories,
  //       getSqlite().prepare(`select name, sql from sqlite_schema`).all(),
  //     ];
  //   },
  //   {
  //     refetchOnWindowFocus: true,
  //     refetchOnReconnect: true,
  //   }
  // );

  return (
    <main>
      <h1>Hello world!</h1>
      <pre>{JSON.stringify({}, undefined, 2)}</pre>
      <p>Welcome to the Rakkas demo page 💃</p>
      <p>
        Try editing the files in <code>src/routes</code> to get started or go to
        the{" "}
        <a href="https://rakkasjs.org" target="_blank" rel="noreferrer">
          website
        </a>
        .
      </p>
      <p>
        You may also check the little <a href="/todo">todo application</a> to
        learn about API endpoints and data fetching.
      </p>
    </main>
  );
};

export default HomePage;
