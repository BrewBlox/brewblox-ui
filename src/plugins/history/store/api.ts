import { WS_HOST } from '@/helpers/const';
import http from '@/helpers/http';
import { createApi } from '@/plugins/database/api';

import { ApiQuery, LoggedSession, QueryResult } from '../types';


export const historyApi = {
  openStream:
    (): WebSocket =>
      new WebSocket(`${WS_HOST}/history/history/stream`),

  fetchFields:
    async (includeStale: boolean): Promise<Mapped<any>> =>
      http.post<Mapped<any>>('/history/history/fields', { include_stale: includeStale })
        .then(resp => resp.data),

  fetchValues:
    async (query: ApiQuery): Promise<QueryResult> =>
      http.post<QueryResult>('/history/history/values', query)
        .then(resp => resp.data),
};

export const sessionApi = createApi<LoggedSession>('logged-sessions');
