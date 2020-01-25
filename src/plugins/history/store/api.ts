import mapKeys from 'lodash/mapKeys';
import queryString from 'query-string';

import { generate } from '@/helpers/database-api';
import { get, post } from '@/helpers/fetch';
import { snakeCased } from '@/helpers/functional';
import { sse } from '@/helpers/sse';

import { LoggedSession, QueryParams, QueryResult, QueryTarget } from '../types';

const snakeCasedObj =
  (obj: Mapped<any>): Mapped<any> =>
    mapKeys(obj, (_, key) => snakeCased(key));

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

export const historyApi = {
  subscribeValues:
    async (params: QueryParams, target: QueryTarget): Promise<EventSource> =>
      sse(`/history/sse/values?${queryString.stringify({
        ...snakeCasedObj(timeFormatted(params)),
        ...snakeCasedObj(target),
      })}`),

  subscribeMetrics:
    async (params: QueryParams, target: QueryTarget): Promise<EventSource> =>
      sse(`/history/sse/last_values?${queryString.stringify({
        ...snakeCasedObj(params),
        ...snakeCasedObj(target),
      })}`),

  fetchKnownKeys:
    async (): Promise<Mapped<any>> =>
      post('/history/query/objects', {}),

  fetchValues:
    async (params: QueryParams, target: QueryTarget): Promise<QueryResult> =>
      post('/history/query/values', {
        ...snakeCasedObj(timeFormatted(params)),
        ...snakeCasedObj(target),
      }),

  validateService:
    async (): Promise<boolean> =>
      get('/history/_service/status')
        .then(retv => retv.status === 'ok')
        .catch(() => false),
};

export const sessionApi = generate<LoggedSession>('logged-sessions');
