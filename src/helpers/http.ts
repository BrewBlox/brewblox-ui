import axios, { AxiosError, AxiosTransformer } from 'axios';
import isArray from 'lodash/isArray';
import isObject from 'lodash/isObject';
import isString from 'lodash/isString';

import { HOST } from '@/helpers/const';
import notify from '@/helpers/notify';
import { deserialize, serialize } from '@/plugins/spark/parse-object';

const { transformRequest, transformResponse } = axios.defaults;

function asArray(value: typeof transformRequest | typeof transformResponse): AxiosTransformer[] {
  if (value === undefined) {
    return [];
  }
  else if (isArray(value)) {
    return [...value];
  }
  else {
    return [value];
  }
}

const instance = axios.create({
  baseURL: HOST,
  transformRequest: [data => serialize(data), ...asArray(transformRequest)],
  transformResponse: [...asArray(transformResponse), data => deserialize(data)],
});

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
