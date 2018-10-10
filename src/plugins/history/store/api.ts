import queryString from 'query-string';
import { post, sse } from '@/helpers/fetch';
import { Slice, HistoryOptions } from '@/plugins/history/state';
import { defaultMaxPoints } from './getters';

const snakeCased = (obj: any) =>
  Object.keys(obj)
    .filter(key => !!obj[key])
    .reduce(
      (acc: any, key: string) => {
        // camelCasedKey => camel_cased_key
        const snakeKey = key.replace(/\.?([A-Z]+)/g, (_, v: string) => `_${v.toLowerCase()}`);
        acc[snakeKey] = obj[key];
        return acc;
      },
      {},
    );

const fetchData = async (serviceId: string, endpoint: string, payload: any = {}) =>
  post(`/${serviceId}${endpoint}`, { ...payload });

export const fetchValueSource = async (serviceId: string, options: HistoryOptions) =>
  sse(`/${serviceId}/sse/values?${queryString.stringify(snakeCased(options))}`);

export const fetchValues = async (
  serviceId: string,
  options: HistoryOptions,
): Promise<Slice[]> =>
  fetchData(serviceId, '/query/values', snakeCased(options))
    .then(response => (response.values || []));

export const fetchKnownKeys = async (serviceId: string) =>
  fetchData(serviceId, '/query/objects');
