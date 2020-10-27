import { WS_HOST } from '@/helpers/const';
import http from '@/helpers/http';
import { createApi } from '@/plugins/database/api';

import { ApiQuery, LoggedSession, QueryResult } from '../types';


export const historyApi = {
  openStream:
    (): WebSocket =>
      new WebSocket(`${WS_HOST}/history/query/stream`),

  fetchKnownKeys:
    async (): Promise<Mapped<any>> =>
      http.post<Mapped<any>>('/history/query/objects', {})
        .then(resp => resp.data),

  fetchValues:
    async (query: ApiQuery): Promise<QueryResult> =>
      http.post<QueryResult>('/history/query/values', query)
        .then(resp => resp.data),

  validateService:
    async (): Promise<boolean> =>
      http.get<{ status: string }>('/history/_service/status')
        .then(resp => resp.data.status === 'ok')
        .catch(() => false),
};

export const sessionApi = createApi<LoggedSession>('logged-sessions');
