import mapKeys from 'lodash/mapKeys';
import queryString from 'query-string';

import { HOSTNAME, PORT } from '@/helpers/const';
import { isoDateString, snakeCased } from '@/helpers/functional';
import http from '@/helpers/http';
import { sse } from '@/helpers/sse';
import { createApi } from '@/plugins/database/api';

import { LoggedSession, QueryParams, QueryResult, QueryTarget } from '../types';

const snakeCasedObj =
  (obj: Mapped<any>): Mapped<any> =>
    mapKeys(obj, (_, key) => snakeCased(key));

const timeFormatted =
  (params: QueryParams): QueryParams =>
    ({
      ...params,
      start: isoDateString(params.start),
      end: isoDateString(params.end),
    });

export const historyApi = {
  subscribeValuesWs:
    async (params: QueryParams, target: QueryTarget): Promise<WebSocket> => {
      const ws = new WebSocket(`wss://${HOSTNAME}:${PORT}/history/query/stream/values`);
      ws.onopen = () => ws.send(JSON.stringify({
        ...snakeCasedObj(timeFormatted(params)),
        ...snakeCasedObj(target),
        epoch: 'ms',
      }));
      return ws;
    },

  subscribeMetricsWs:
    async (params: QueryParams, target: QueryTarget): Promise<WebSocket> => {
      const ws = new WebSocket(`wss://${HOSTNAME}:${PORT}/history/query/stream/last_values`);
      ws.onopen = () => ws.send(JSON.stringify({
        ...snakeCasedObj(params),
        ...snakeCasedObj(target),
        epoch: 'ms',
      }));
      return ws;
    },

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
