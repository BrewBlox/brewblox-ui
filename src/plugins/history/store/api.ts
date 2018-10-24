import queryString from 'query-string';
import { post, sse, get } from '@/helpers/fetch';
import { snakeCased } from '@/helpers/functional';
import { QueryParams, QueryTarget } from '@/plugins/history/state';

const snakeCasedObj = (obj: any) =>
  Object.keys(obj)
    .filter(key => !!obj[key])
    .reduce((acc: any, key: string) => ({ ...acc, [snakeCased(key)]: obj[key] }), {});

const fetchData = async (serviceId: string, endpoint: string, payload: any = {}) =>
  post(`/${serviceId}${endpoint}`, { ...payload });

export const fetchValueSource = async (
  serviceId: string,
  params: QueryParams,
  target: QueryTarget,
) =>
  sse(`/${serviceId}/sse/values?${queryString.stringify({
    ...snakeCasedObj(params),
    ...snakeCasedObj(target),
  })}`);

export const fetchKnownKeys = async (serviceId: string) =>
  fetchData(serviceId, '/query/objects');

export const validateService = async (serviceId: string): Promise<boolean> =>
  get(`/${encodeURIComponent(serviceId)}/_service/status`)
    .then(retv => retv.status === 'ok')
    .catch(() => false);
