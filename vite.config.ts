import { defineConfig } from 'vite';
import rakkas from 'rakkasjs/vite-plugin';
import tsconfigPaths from 'vite-tsconfig-paths';
import monacoEditorPlugin from 'vite-plugin-monaco-editor';
import { adapterCloudflarePages } from './src/adapter-cloudflare-pages/adapter-cloudflare-pages';

export default defineConfig(({ ssrBuild }) => ({
  plugins: [
    tsconfigPaths(),
    rakkas({
      adapter: adapterCloudflarePages,
      // adapter: 'cloudflare-workers',
    }),
    ...(ssrBuild
      ? []
      : [
          monacoEditorPlugin.default({
            languageWorkers: ['editorWorkerService', 'json'],
          }),
        ]),
    {
      name: 'disable-public-files',
      config(config, env) {
        if (env.ssrBuild) {
          return {
            build: {
              copyPublicDir: false,
            },
          };
        }
      },
    },
  ],
  // ssr: {
  //   format: "esm",
  //   target: "webworker",
  // },
}));
