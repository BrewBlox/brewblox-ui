import queryString from 'query-string';
import { post, sse, get } from '@/helpers/fetch';
import { snakeCased } from '@/helpers/functional';
import { QueryParams, QueryTarget } from '@/store/history/state';

const snakeCasedObj = (obj: any) =>
  Object.keys(obj)
    .filter(key => !!obj[key])
    .reduce((acc: any, key: string) => ({ ...acc, [snakeCased(key)]: obj[key] }), {});

export const fetchValueSource = async (
  params: QueryParams,
  target: QueryTarget,
) =>
  sse(`/history/sse/values?${queryString.stringify({
    ...snakeCasedObj(params),
    ...snakeCasedObj(target),
  })}`);

export const fetchKnownKeys = async () =>
  post('/history/query/objects', {});

export const validateService = async (): Promise<boolean> =>
  get('/history/_service/status')
    .then(retv => retv.status === 'ok')
    .catch(() => false);
