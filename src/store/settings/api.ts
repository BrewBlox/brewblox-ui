import { get, put } from '@/core/fetch';

import { Settings } from './state';

export function fetchSettings(): Promise<Settings> {
  return get('/settings');
}

export function persistSettings(settings: Settings): Promise<any> {
  return put('/settings', settings);
}
