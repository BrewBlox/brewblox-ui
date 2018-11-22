import { del, get, post, put } from '@/helpers/fetch';
import { Service } from './state';

export const fetchServices = async (): Promise<Service[]> =>
  get('/datastore/services');

export const fetchServiceById = async (id: string): Promise<Service> =>
  get(`/datastore/services/${encodeURIComponent(id)}`);

export const createService = async (service: Service): Promise<Service> =>
  post('/datastore/services', service);

export const updateService = async (service: Service): Promise<Service> =>
  put(`/datastore/services/${encodeURIComponent(service.id)}`, service);

export const deleteService = async (service: Service): Promise<Service> =>
  del(`/datastore/services/${encodeURIComponent(service.id)}`, service);
