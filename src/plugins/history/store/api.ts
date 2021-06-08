import { UI_NAMESPACE, WS_HOST } from '@/const';
import { createApi } from '@/database/api';
import { http } from '@/utils';

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

export const sessionApi = createApi<LoggedSession>({
  namespace: `${UI_NAMESPACE}:logged-sessions`,
});
