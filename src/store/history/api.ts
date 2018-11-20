import queryString from 'query-string';
import { post, sse, get } from '@/helpers/fetch';
import { snakeCased } from '@/helpers/functional';
import { QueryParams, QueryTarget } from '@/store/history/state';

const snakeCasedObj = (obj: any) =>
  Object.keys(obj)
    .filter(key => !!obj[key])
    .reduce((acc: any, key: string) => ({ ...acc, [snakeCased(key)]: obj[key] }), {});

const formatTime = (val?: string | number): string | undefined =>
  (isNaN(val as number)
    ? val as string
    : new Date(Number(val)).toUTCString());

const timeFormatted = (params: QueryParams) =>
  ({
    ...params,
    start: formatTime(params.start),
    end: formatTime(params.end),
  });

export const fetchValueSource = async (
  params: QueryParams,
  target: QueryTarget,
) =>
  sse(`/history/sse/values?${queryString.stringify({
    ...snakeCasedObj(timeFormatted(params)),
    ...snakeCasedObj(target),
  })}`);

export const fetchKnownKeys = async () =>
  post('/history/query/objects', {});

export const validateService = async (): Promise<boolean> =>
  get('/history/_service/status')
    .then(retv => retv.status === 'ok')
    .catch(() => false);
