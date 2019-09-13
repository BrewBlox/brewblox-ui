import { Notify } from 'quasar';

import { del, get, post, sse } from '@/helpers/fetch';
import { deserialize, serialize } from '@/helpers/units/parseObject';

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
      .then(procs => deserialize(procs))
      .catch(intercept('Failed to fetch all processes'));


export const clearProcesses =
  async (): Promise<void> =>
    del('/stepper/process', {})
      .catch(intercept('Failed to clear processes'));


export const createProcess =
  async (process: Process): Promise<Process> =>
    post('/stepper/process', serialize(process))
      .then(proc => deserialize(proc))
      .catch(intercept('Failed to create process'));


export const fetchProcess =
  async ({ id }: { id: string }): Promise<Process> =>
    get(`/stepper/process/${encodeURIComponent(id)}`)
      .then(proc => deserialize(proc))
      .catch(intercept(`Failed to fetch process ${id}`));


export const persistProcess =
  async (process: Process): Promise<Process> =>
    post(`/stepper/process/${encodeURIComponent(process.id)}`, process)
      .then(proc => deserialize(proc))
      .catch(intercept(`Failed to persist process ${process.id}`));


export const removeProcess =
  async ({ id }: { id: string }): Promise<void> =>
    del(`/stepper/process/${encodeURIComponent(id)}`, {})
      .catch(intercept(`Failed to remove process ${id}`));


export const startProcess =
  async (process: Process): Promise<Runtime> =>
    post(`/stepper/start/${encodeURIComponent(process.id)}`, {})
      .catch(intercept(`Failed to start process ${process.id}`));


export const advanceProcess =
  async ({ id }: { id: string }): Promise<Runtime> =>
    post(`/stepper/advance/${encodeURIComponent(id)}`, {})
      .catch(intercept(`Failed to advance process ${id}`));


export const fetchRuntimes =
  async (): Promise<Runtime[]> =>
    get('/stepper/runtime')
      .then(vals => deserialize(vals))
      .catch(intercept('Failed to fetch all process runtimes'));


export const fetchRuntime =
  async ({ id }: { id: string }): Promise<Runtime> =>
    get(`/stepper/runtime/${encodeURIComponent(id)}`)
      .then(res => deserialize(res))
      .catch(intercept(`Failed to fetch process runtime ${id}`));


export const subscribe =
  async (): Promise<EventSource> =>
    sse('/stepper/sse/runtime');


export const exitRuntime =
  async ({ id }: { id: string }): Promise<Runtime> =>
    post(`/stepper/exit/${encodeURIComponent(id)}`, {})
      .catch(intercept(`Failed to exit process ${id}`));
