import { AxiosResponse } from 'axios';

import { UI_NAMESPACE, WS_HOST } from '@/const';
import { createApi } from '@/database/api';
import { http } from '@/utils/http';

import { CsvQuery, LoggedSession } from '../types';

export const historyApi = {
  openStream: (): WebSocket =>
    new WebSocket(`${WS_HOST}/history/timeseries/stream`),

  fetchFields: async (duration: string): Promise<string[]> =>
    http
      .post<{ duration: string }, AxiosResponse<string[]>>(
        '/history/timeseries/fields',
        { duration },
      )
      .then((resp) => resp.data),

  downloadCsv: async (query: CsvQuery): Promise<Blob> =>
    http
      .post<CsvQuery, AxiosResponse<Blob>>('/history/timeseries/csv', query, {
        responseType: 'blob',
      })
      .then((resp) => resp.data),
};

export const sessionApi = createApi<LoggedSession>({
  namespace: `${UI_NAMESPACE}:logged-sessions`,
});
