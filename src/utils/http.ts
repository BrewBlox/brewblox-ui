import { notify } from './notify';
import { HOST, PROTOCOL } from '@/const';
import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import get from 'lodash/get';

export const http = axios.create({ baseURL: HOST });

http.interceptors.request.use((cfg: InternalAxiosRequestConfig) => {
  if (PROTOCOL === 'https' && cfg.baseURL === HOST) {
    cfg.withCredentials = true;
  }
  return cfg;
});

/**
 * Extracts human-readable error message from given Axios error.
 *
 * @param e
 * @param verbose
 * @returns
 */
export function parseHttpError(e: unknown, verbose = false): string {
  if (axios.isAxiosError(e)) {
    const resp = get(e, 'response.data', e.message ?? null);
    const err = resp instanceof Object ? JSON.stringify(resp) : resp;
    if (!verbose) {
      return err;
    }
    const url = get(e, 'response.config.url');
    const status = get(e, 'response.status');
    return `url=${url}, status=${status}, response=${err}`;
  } else {
    return `Unknown HTTP error: ${e}`;
  }
}

/**
 * Higher order function to show a human-readable error notification for API errors.
 * The error argument is rethrown after handling.
 *
 * The below example will show an error notification with the description + error message
 * if the http call fails.
 *
 * ```ts
 * http.post('/service/endpoint', data)
 *   .then(resp => resp.data)
 *   .catch(intercept('Failed to call endpoint'));
 * ```
 *
 * @param desc
 * @returns
 */
export function intercept(desc: string): (e: AxiosError) => never {
  return (e: AxiosError) => {
    notify.warn(`${desc}: ${parseHttpError(e)}`);
    throw e;
  };
}
