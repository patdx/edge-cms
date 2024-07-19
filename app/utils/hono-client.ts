import type { AppType } from '../routes/api.rpc.$';
import { hc } from 'hono/client';

export const honoClient = hc<AppType>('/api/rpc');
