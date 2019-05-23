import { get, post, sse } from '@/helpers/fetch';
import { snakeCased } from '@/helpers/functional';
import { QueryParams, QueryTarget } from '@/store/history';
import queryString from 'query-string';

const snakeCasedObj =
  (obj: Record<string, any>): Record<string, any> =>
    Object.keys(obj)
      .filter(key => !!obj[key])
      .reduce((acc: any, key: string) => ({ ...acc, [snakeCased(key)]: obj[key] }), {});

const formatTime =
  (val?: string | number): string | undefined =>
    (Number.isNaN(Number(val))
      ? val as string
      : new Date(Number(val)).toUTCString());

const timeFormatted =
  (params: QueryParams): QueryParams =>
    ({
      ...params,
      start: formatTime(params.start),
      end: formatTime(params.end),
    });

export const subscribeValues =
  async (params: QueryParams, target: QueryTarget): Promise<EventSource> =>
    sse(`/history/sse/values?${queryString.stringify({
      ...snakeCasedObj(timeFormatted(params)),
      ...snakeCasedObj(target),
    })}`);

export const subscribeMetrics =
  async (params: QueryParams, target: QueryTarget): Promise<EventSource> =>
    sse(`/history/sse/last_values?${queryString.stringify({
      ...snakeCasedObj(params),
      ...snakeCasedObj(target),
    })}`);

export const fetchKnownKeys =
  async (): Promise<Record<string, any>> => post('/history/query/objects', {});

export const validateService =
  async (): Promise<boolean> =>
    get('/history/_service/status')
      .then(retv => retv.status === 'ok')
      .catch(() => false);
