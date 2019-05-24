import { fetchJson,get } from '@/helpers/fetch';

export const getBackend =
  async (url: string): Promise<any> => get(url);

export const getExternal =
  async (url: string): Promise<any> => fetchJson(url);
