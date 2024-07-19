import {
	vitePlugin as remix,
	cloudflareDevProxyVitePlugin as remixCloudflareDevProxy,
} from '@remix-run/dev';
import AutoImport from 'unplugin-auto-import/vite';
import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig(({ isSsrBuild }) => ({
	plugins: [
		// cjsInterop({
		// 	// List of CJS dependencies that require interop
		// 	dependencies: ['@rjsf/core', '@rjsf/utils'],
		// }),
		AutoImport({
			imports: [
				{
					clsx: [['default', 'clsx']],
					'@remix-run/cloudflare': [['unstable_defineLoader', 'defineLoader']],
				},
				{
					from: '@tanstack/react-query',
					imports: ['useMutation'],
				},
				{
					from: '@remix-run/react',
					imports: [
						'Link',
						'useLoaderData',
						'useParams',
						'useRevalidator',
						'useNavigate',
					],
				},
				{
					from: '@hono/zod-validator',
					imports: ['zValidator'],
				},
				{
					from: 'zod',
					imports: ['z'],
				},
				{
					from: '@remix-run/cloudflare',
					imports: ['AppLoadContext'],
					type: true,
				},
			],
			dirs: ['./app/components/*', './app/utils/*'],

			dts: true,
		}),
		remixCloudflareDevProxy(),
		remix({
			future: {
				v3_fetcherPersist: true,
				v3_relativeSplatPath: true,
				v3_throwAbortReason: true,
				unstable_singleFetch: true,
				unstable_fogOfWar: true,
			},
		}),
		tsconfigPaths(),
	],
	ssr: {
		// try to fix bundling issues
		noExternal: ['@rjsf/core', '@rjsf/utils'],
		target: 'webworker',
	},
}));

// import { defineConfig } from 'vite';
// import rakkas from 'rakkasjs/vite-plugin';
// import tsconfigPaths from 'vite-tsconfig-paths';
// import monacoEditorPlugin from 'vite-plugin-monaco-editor';
// import { adapterCloudflarePages } from './src/adapter-cloudflare-pages/adapter-cloudflare-pages';

// export default defineConfig(({ ssrBuild }) => ({
// 	plugins: [
// 		tsconfigPaths(),
// 		rakkas({
// 			adapter: adapterCloudflarePages,
// 			// adapter: 'cloudflare-workers',
// 		}),
// ...(ssrBuild
// 	? []
// 	: [
// 			monacoEditorPlugin.default({
// 				languageWorkers: ['editorWorkerService', 'json'],
// 			}),
// 		]),
// 		{
// 			name: 'disable-public-files',
// 			config(config, env) {
// 				if (env.ssrBuild) {
// 					return {
// 						build: {
// 							copyPublicDir: false,
// 						},
// 					};
// 				}
// 			},
// 		},
// 	],
// 	// ssr: {
// 	//   format: "esm",
// 	//   target: "webworker",
// 	// },
// }));
