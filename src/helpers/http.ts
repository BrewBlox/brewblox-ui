import axios, { AxiosError } from 'axios';
import isObject from 'lodash/isObject';
import isString from 'lodash/isString';

import { HOST } from '@/helpers/const';
import notify from '@/helpers/notify';

const instance = axios.create({ baseURL: HOST });

export function intercept(desc: string): ((e: AxiosError) => never) {
  return (e: AxiosError) => {
    const data = e.response?.data;
    const message = isObject(data)
      ? JSON.stringify(data)
      : isString(data)
        ? data
        : e.message;
    notify.warn(`${desc}: ${message}`);
    throw e;
  };
}

export default instance;
