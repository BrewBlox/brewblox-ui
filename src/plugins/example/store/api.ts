import { get, toJson } from '@/helpers/fetch';

export const getBackend = async (url: string) =>
  get(url);

export const getExternal = async (url: string) =>
  toJson(window.fetch(url));
