import { get } from '@/helpers/fetch';

import { Service } from './state';

export function fetchServices(): Promise<Service[]> {
  return get('/datastore/services');
}
