import { Notify } from 'quasar';

import { generate } from '@/helpers/database-api';
import { get, post, sse } from '@/helpers/fetch';

import { Process, Runtime } from '../types';

const intercept = (message: string): (e: Error) => never =>
  (e: Error) => {
    Notify.create({
      color: 'warning',
      icon: 'warning',
      message: `${message}: ${e.message}`,
    });
    throw e;
  };

export const processApi = generate<Process>('processes', true);

export const runtimeApi = {
  start: async (process: Process): Promise<Runtime> =>
    post('/stepper/start', { ...process, _rev: undefined })
      .catch(intercept(`Failed to start process ${process.id}`)),

  stop: async ({ id }: { id: string }): Promise<Runtime> =>
    post(`/stepper/stop/${encodeURIComponent(id)}`, {})
      .catch(intercept(`Failed to stop runtime ${id}`)),

  advance: async ({ id }: { id: string }): Promise<Runtime> =>
    post(`/stepper/advance/${encodeURIComponent(id)}`, {})
      .catch(intercept(`Failed to advance runtime ${id}`)),

  exit: async ({ id }: { id: string }): Promise<Runtime> =>
    post(`/stepper/exit/${encodeURIComponent(id)}`, {})
      .catch(intercept(`Failed to exit runtime ${id}`)),

  fetch: async (): Promise<Runtime[]> =>
    get('/stepper/runtime')
      .catch(intercept('Failed to fetch all runtimes')),

  fetchById: async (id: string): Promise<Runtime> =>
    get(`/stepper/runtime/${encodeURIComponent(id)}`)
      .catch(intercept(`Failed to fetch runtime ${id}`)),

  subscribe: async (): Promise<EventSource> =>
    sse('/stepper/sse/runtime'),
};
