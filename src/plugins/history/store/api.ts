import isFinite from 'lodash/isFinite';
import isString from 'lodash/isString';
import mapKeys from 'lodash/mapKeys';
import { date } from 'quasar';
import queryString from 'query-string';

import { snakeCased } from '@/helpers/functional';
import http from '@/helpers/http';
import { sse } from '@/helpers/sse';
import { createApi } from '@/plugins/database/api';

import { LoggedSession, QueryParams, QueryResult, QueryTarget } from '../types';

const snakeCasedObj =
  (obj: Mapped<any>): Mapped<any> =>
    mapKeys(obj, (_, key) => snakeCased(key));

const formatTime =
  (val: Date | number | string | undefined): string | undefined => {
    if (val instanceof Date) {
      return val.toISOString();
    }
    const numV = Number(val);
    if (isFinite(numV) && date.isValid(numV)) {
      return new Date(numV).toISOString();
    }
    if (isString(val) && date.isValid(val)) {
      return new Date(val).toISOString();
    }
    return undefined;
  };

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
        epoch: 'ms',
      })}`),

  subscribeMetrics:
    async (params: QueryParams, target: QueryTarget): Promise<EventSource> =>
      sse(`/history/sse/last_values?${queryString.stringify({
        ...snakeCasedObj(params),
        ...snakeCasedObj(target),
        epoch: 'ms',
      })}`),

  fetchKnownKeys:
    async (): Promise<Mapped<any>> =>
      http.post<Mapped<any>>('/history/query/objects', {})
        .then(resp => resp.data),

  fetchValues:
    async (params: QueryParams, target: QueryTarget, epoch: string): Promise<QueryResult> =>
      http.post<QueryResult>('/history/query/values', {
        ...snakeCasedObj(timeFormatted(params)),
        ...snakeCasedObj(target),
        epoch,
      })
        .then(resp => resp.data),

  validateService:
    async (): Promise<boolean> =>
      http.get<{ status: string }>('/history/_service/status')
        .then(resp => resp.data.status === 'ok')
        .catch(() => false),
};

export const sessionApi = createApi<LoggedSession>('logged-sessions');
