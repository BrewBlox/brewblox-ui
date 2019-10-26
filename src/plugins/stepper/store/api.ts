import { Notify } from 'quasar';

import { del, get, post, put, sse } from '@/helpers/fetch';

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


export const fetchProcesses =
  async (): Promise<Process[]> =>
    get('/stepper/process')
      .catch(intercept('Failed to fetch all processes'));


export const clearProcesses =
  async (): Promise<void> =>
    del('/stepper/process', {})
      .catch(intercept('Failed to clear processes'));


export const createProcess =
  async (process: Process): Promise<Process> =>
    post('/stepper/process', process)
      .catch(intercept('Failed to create process'));


export const fetchProcess =
  async ({ id }: { id: string }): Promise<Process> =>
    get(`/stepper/process/${encodeURIComponent(id)}`)
      .catch(intercept(`Failed to fetch process ${id}`));


export const persistProcess =
  async (process: Process): Promise<Process> =>
    put(`/stepper/process/${encodeURIComponent(process.id)}`, process)
      .catch(intercept(`Failed to persist process ${process.id}`));


export const removeProcess =
  async ({ id }: { id: string }): Promise<void> =>
    del(`/stepper/process/${encodeURIComponent(id)}`, {})
      .catch(intercept(`Failed to remove process ${id}`));


export const start =
  async (process: Process): Promise<Runtime> =>
    post(`/stepper/start/${encodeURIComponent(process.id)}`, {})
      .catch(intercept(`Failed to start process ${process.id}`));


export const stop =
  async ({ id }: { id: string }): Promise<Runtime> =>
    post(`/stepper/stop/${encodeURIComponent(id)}`, {})
      .catch(intercept(`Failed to stop runtime ${id}`));


export const advance =
  async ({ id }: { id: string }): Promise<Runtime> =>
    post(`/stepper/advance/${encodeURIComponent(id)}`, {})
      .catch(intercept(`Failed to advance runtime ${id}`));


export const exit =
  async ({ id }: { id: string }): Promise<Runtime> =>
    post(`/stepper/exit/${encodeURIComponent(id)}`, {})
      .catch(intercept(`Failed to exit runtime ${id}`));


export const fetchRuntimes =
  async (): Promise<Runtime[]> =>
    get('/stepper/runtime')
      .catch(intercept('Failed to fetch all runtimes'));


export const fetchRuntime =
  async ({ id }: { id: string }): Promise<Runtime> =>
    get(`/stepper/runtime/${encodeURIComponent(id)}`)
      .catch(intercept(`Failed to fetch runtime ${id}`));


export const subscribe =
  async (): Promise<EventSource> =>
    sse('/stepper/sse/runtime');

