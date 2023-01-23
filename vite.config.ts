import { defineConfig } from 'vite';
import rakkas from 'rakkasjs/vite-plugin';
import tsconfigPaths from 'vite-tsconfig-paths';
import monacoEditorPlugin from 'vite-plugin-monaco-editor';
// import { cloudflareWorkersCustomAdapter } from './build-tools/cloudflare-workers-adapter';

console.log(monacoEditorPlugin);

export default defineConfig({
  plugins: [
    tsconfigPaths(),
    rakkas({
      adapter: 'cloudflare-workers',
      // adapter: cloudflareWorkersCustomAdapter,
    }),
    monacoEditorPlugin.default({
      languageWorkers: ['editorWorkerService', 'json'],
    }),
  ],
  // ssr: {
  //   format: "esm",
  //   target: "webworker",
  // },
});
