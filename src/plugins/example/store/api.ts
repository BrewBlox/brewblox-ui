import { get, toJson } from '@/helpers/fetch';

export const getBackend =
  async (url: string): Promise<any> => get(url);

export const getExternal =
  async (url: string): Promise<any> => toJson(window.fetch(url));
