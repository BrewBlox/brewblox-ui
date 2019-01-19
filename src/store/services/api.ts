import { registerModule, fetchAll, fetchById, create, persist, remove } from '@/helpers/database';
import { Service } from './state';

const SERVICES = 'services';

export const setup = (
  onChanged: (doc: any) => void,
  onDeleted: (id: string) => void,
) => registerModule({ onChanged, onDeleted, id: SERVICES });

export const fetchServices = async (): Promise<Service[]> =>
  fetchAll(SERVICES);

export const fetchServiceById = async (id: string): Promise<Service> =>
  fetchById(SERVICES, id);

export const createService = async (service: Service): Promise<Service> =>
  create(SERVICES, service);

export const persistService = async (service: Service): Promise<Service> =>
  persist(SERVICES, service);

export const deleteService = async (service: Service): Promise<Service> =>
  remove(SERVICES, service);
