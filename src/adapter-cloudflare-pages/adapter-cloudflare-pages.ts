import cloudflareWorkers from '@hattip/bundler-cloudflare-workers';
import path from 'node:path';
import fs from 'node:fs';

interface RakkasAdapter {
	name: string;
	bundle?(root: string): Promise<void>;
	disableStreaming?: boolean;
}

export const adapterCloudflarePages: RakkasAdapter = {
	name: 'cloudflare-pages',
	async bundle(root: string) {
		let entry: string | undefined = undefined;
		// let entry = findEntry(root, 'src/entry-cloudflare-workers');

		// if (!entry) {
		entry = path.resolve(root, 'dist/server/entry-cloudflare-workers.ts');
		await fs.promises.copyFile(
			'src/adapter-cloudflare-pages/entry-cloudflare-workers.ts',
			entry,
		);
		//   await fs.promises.writeFile(entry, CLOUDFLARE_WORKERS_ENTRY);
		// }

		console.log('Start bundling cloudflare pages');

		await cloudflareWorkers(
			{
				output: path.resolve(root, 'dist/client/_worker.js'),
				cfwEntry: entry,
			},
			(options) => {
				// options.minify = false;
				options.define = options.define || {};
				options.define['process.env.RAKKAS_PRERENDER'] = 'undefined';
				options.define.global = 'globalThis';
				options.external = options.external || [];
				options.external.push('node:async_hooks');
			},
		);

		console.log('Done bundling cloudflare pages');
	},
};
