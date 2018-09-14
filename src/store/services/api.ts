import { get, put, post, del } from '@/helpers/fetch';

import { Service } from './state';

export function fetchServices(): Promise<Service[]> {
  return get('/datastore/services');
}

export function fetchServiceById(id: string): Promise<Service> {
  return get(`/datastore/services/${encodeURIComponent(id)}`);
}

export function createService(service: Service): Promise<Service> {
  return post('/datastore/services', service);
}

export function persistService(service: Service): Promise<Service> {
  return put(
    `/datastore/services/${encodeURIComponent(service.id)}`,
    service,
  );
}

export function deleteService(service: Service): Promise<string> {
  return del(
    `/datastore/services/${encodeURIComponent(service.id)}`,
    service,
  ).then(response => response.id);
}
