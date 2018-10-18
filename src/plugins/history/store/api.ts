import queryString from 'query-string';
import { post, sse, get } from '@/helpers/fetch';
import { Slice, QueryParams, QueryTarget } from '@/plugins/history/state';

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

export const fetchValueSource = async (
  serviceId: string,
  params: QueryParams,
  target: QueryTarget,
) =>
  sse(`/${serviceId}/sse/values?${queryString.stringify({
    ...snakeCased(params),
    ...snakeCased(target),
  })}`);

export const fetchKnownKeys = async (serviceId: string) =>
  fetchData(serviceId, '/query/objects');

export const validateService = async (serviceId: string): Promise<boolean> =>
  get(`/${encodeURIComponent(serviceId)}/_service/status`)
    .then(retv => retv.status === 'ok')
    .catch(() => false);
