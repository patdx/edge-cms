import { defineConfig } from 'vite';
import rakkas from 'rakkasjs/vite-plugin';
import tsconfigPaths from 'vite-tsconfig-paths';
// import { cloudflareWorkersCustomAdapter } from './build-tools/cloudflare-workers-adapter';

export default defineConfig({
  plugins: [
    tsconfigPaths(),
    rakkas({
      adapter: 'cloudflare-workers',
      // adapter: cloudflareWorkersCustomAdapter,
    }),
  ],
  // ssr: {
  //   format: "esm",
  //   target: "webworker",
  // },
});
