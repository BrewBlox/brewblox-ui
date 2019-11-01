import mapKeys from 'lodash/mapKeys';
import queryString from 'query-string';

import { get, post, sse } from '@/helpers/fetch';
import { snakeCased } from '@/helpers/functional';
import { QueryParams, QueryTarget } from '@/store/history';

import { QueryResult } from './types';

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
  async (): Promise<Mapped<any>> =>
    post('/history/query/objects', {});

export const fetchValues =
  async (params: QueryParams, target: QueryTarget): Promise<QueryResult> =>
    post('/history/query/values', {
      ...snakeCasedObj(timeFormatted(params)),
      ...snakeCasedObj(target),
    });

export const validateService =
  async (): Promise<boolean> =>
    get('/history/_service/status')
      .then(retv => retv.status === 'ok')
      .catch(() => false);
