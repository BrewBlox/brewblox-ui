import { get, put } from '@/core/fetch';

export function fetchSettings(): Promise<any> {
  return get('/settings');
}

export function persistSettings(settings: any): Promise<any> {
  return put('/settings', settings);
}
