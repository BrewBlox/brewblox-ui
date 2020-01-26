import { generate } from '@/helpers/database-api';
import { get, post } from '@/helpers/fetch';
import notify from '@/helpers/notify';
import { sse } from '@/helpers/sse';

import { Process, Runtime } from '../types';

const intercept = (message: string): (e: Error) => never =>
  (e: Error) => {
    notify.warn(`${message}: ${e.message}`);
    throw e;
  };

export const processApi = generate<Process>('processes', true);

export const runtimeApi = {
  start: async (process: Process): Promise<Runtime> =>
    post('/automation/start', { ...process, _rev: undefined })
      .catch(intercept(`Failed to start process ${process.id}`)),

  stop: async ({ id }: { id: string }): Promise<Runtime> =>
    post(`/automation/stop/${encodeURIComponent(id)}`, {})
      .catch(intercept(`Failed to stop runtime ${id}`)),

  advance: async ({ id }: { id: string }): Promise<Runtime> =>
    post(`/automation/advance/${encodeURIComponent(id)}`, {})
      .catch(intercept(`Failed to advance runtime ${id}`)),

  exit: async ({ id }: { id: string }): Promise<Runtime> =>
    post(`/automation/exit/${encodeURIComponent(id)}`, {})
      .catch(intercept(`Failed to exit runtime ${id}`)),

  fetch: async (): Promise<Runtime[]> =>
    get('/automation/runtime')
      .catch(intercept('Failed to fetch all runtimes')),

  fetchById: async (id: string): Promise<Runtime> =>
    get(`/automation/runtime/${encodeURIComponent(id)}`)
      .catch(intercept(`Failed to fetch runtime ${id}`)),

  subscribe: async (): Promise<EventSource> =>
    sse('/automation/sse/runtime'),
};
