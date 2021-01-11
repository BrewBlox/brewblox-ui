import axios, { AxiosError } from 'axios';
import get from 'lodash/get';

import { HOST } from '@/helpers/const';
import notify from '@/helpers/notify';

const instance = axios.create({ baseURL: HOST });

export function parseHttpError(e: AxiosError, verbose = false): string {
  const resp = get(e, 'response.data', e.message ?? null);
  const err = (resp instanceof Object) ? JSON.stringify(resp) : resp;
  if (!verbose) {
    return err;
  }
  const url = get(e, 'response.config.url');
  const status = get(e, 'response.status');
  return `url=${url}, status=${status}, response=${err}`;
}

export function intercept(desc: string): ((e: AxiosError) => never) {
  return (e: AxiosError) => {
    notify.warn(`${desc}: ${parseHttpError(e)}`);
    throw e;
  };
}

export default instance;
