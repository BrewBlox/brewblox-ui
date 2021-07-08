import { UI_NAMESPACE, WS_HOST } from '@/const';
import { createApi } from '@/database/api';
import { http } from '@/utils/http';

import { LoggedSession } from '../types';


export const historyApi = {
  openStream:
    (): WebSocket =>
      new WebSocket(`${WS_HOST}/history/timeseries/stream`),

  fetchFields:
    async (start: string): Promise<string[]> =>
      http.post<string[]>('/history/timeseries/fields', { start })
        .then(resp => resp.data),

  // TODO(Bob): replace with dedicated CSV fetch
  // fetchValues:
  //   async (query: ApiQuery): Promise<QueryResult> =>
  //     http.post<QueryResult>('/history/history/values', query)
  //       .then(resp => resp.data),
};

export const sessionApi = createApi<LoggedSession>({
  namespace: `${UI_NAMESPACE}:logged-sessions`,
});
