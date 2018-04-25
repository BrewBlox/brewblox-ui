import { get } from '@/core/fetch';

import { Service } from './state';

export function fetchServices(): Promise<Service[]> {
  return get('/services');
}
