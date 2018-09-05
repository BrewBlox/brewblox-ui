import { get, put } from '@/helpers/fetch';

import { Settings } from './state';

export function fetchSettings(): Promise<Settings> {
  return get('/datastore/settings');
}

export function persistSettings(settings: Settings): Promise<any> {
  return put('/datastore/settings', settings);
}
