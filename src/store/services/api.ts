import database from '@/plugins/database';
import { Service } from '@/store/services';

const SERVICES = 'services';

export const setup =
  (onChanged: (doc: any) => void, onDeleted: (id: string) => void, ): void =>
    database.registerModule({ onChanged, onDeleted, id: SERVICES });

export const fetchServices = async (): Promise<Service[]> =>
  database.fetchAll(SERVICES);

export const fetchServiceById = async (id: string): Promise<Service> =>
  database.fetchById(SERVICES, id);

export const createService = async (service: Service): Promise<Service> =>
  database.create(SERVICES, service);

export const persistService = async (service: Service): Promise<Service> =>
  database.persist(SERVICES, service);

export const deleteService = async (service: Service): Promise<Service> =>
  database.remove(SERVICES, service);
