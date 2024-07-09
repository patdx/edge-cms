import type { ExportedHandler } from '@cloudflare/workers-types';
import type * as CFW from '@cloudflare/workers-types';
import cloudflareWorkersAdapter from '@hattip/adapter-cloudflare-workers/no-static';

// @ts-expect-error file does not exist
import hattipHandler from './hattip.js';

const handler = cloudflareWorkersAdapter(hattipHandler);

const createResponse = (body?: CFW.BodyInit | null, init?: CFW.ResponseInit) =>
	new Response(body as any, init as any) as any as CFW.Response;

const exportedHandler: ExportedHandler<{
	ASSETS: {
		fetch: typeof CFW.fetch;
	};
	[key: string | symbol]: any;
}> = {
	async fetch(request, env, ctx) {
		if (!globalThis.process?.env) {
			globalThis.process = globalThis.process || {};
			globalThis.process.env = new Proxy(
				{},
				{
					get(_, key) {
						if (typeof env[key] === 'string') {
							return env[key];
						}
						return undefined;
					},
				},
			);
		}

		let response: CFW.Response | undefined;

		// According to these PRs, it seems that env.ASSETS.fetch may actually
		// include more than just GET or HEAD requests, especially when a
		// _redirects or _headers file is being used. So I adapted this code
		// from Remix
		// https://github.com/remix-run/remix/commit/3143493ac3f6a3374184b2b051b9dcce3705af95
		// https://github.com/remix-run/remix/commit/488f2194b5c2491c93029bf513b87989671dcef5

		try {
			response = await env.ASSETS.fetch(request.url, request.clone() as any);
			response =
				response && response.status >= 200 && response.status < 400
					? createResponse(response.body, response)
					: undefined;
		} catch {}

		if (!response) {
			response = await handler(request, env, ctx);
		}

		return response!;
	},
};

export default exportedHandler;
