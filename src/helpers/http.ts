import axios, { AxiosError } from 'axios';
import isObject from 'lodash/isObject';
import isString from 'lodash/isString';

import { HOST } from '@/helpers/const';
import notify from '@/helpers/notify';

const instance = axios.create({ baseURL: HOST });

export function parseHttpError(e: AxiosError): string {
  const data = e.response?.data;
  return isObject(data)
    ? JSON.stringify(data)
    : isString(data)
      ? data
      : e.message;
}

export function intercept(desc: string): ((e: AxiosError) => never) {
  return (e: AxiosError) => {
    notify.warn(`${desc}: ${parseHttpError(e)}`);
    throw e;
  };
}

export default instance;
