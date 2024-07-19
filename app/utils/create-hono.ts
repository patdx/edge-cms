import type { AppLoadContext } from '@remix-run/cloudflare';
import { Hono } from 'hono';

export function createHono() {
	return new Hono<{
		Bindings: AppLoadContext;
	}>();
}
