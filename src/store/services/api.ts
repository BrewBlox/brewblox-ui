import { createDatabase, fromDocument, toDocument, toNewDocument } from '@/helpers/database';
import { Service } from './state';

const serviceDB = createDatabase('services');

export const fetchServices = async (): Promise<Service[]> =>
  serviceDB.allDocs({ include_docs: true })
    .then(resp =>
      resp.rows
        .map(row => fromDocument(row.doc) as Service));

export const fetchServiceById = async (id: string): Promise<Service> =>
  serviceDB.get(id)
    .then(fromDocument);

export const createService = async (service: Service): Promise<Service> =>
  serviceDB.put(toNewDocument(service))
    .then(resp => ({ ...service, _rev: resp.rev }));

export const updateService = async (service: Service): Promise<Service> =>
  serviceDB.put(toDocument(service))
    .then(resp => ({ ...service, _rev: resp.rev }));

export const deleteService = async (service: Service): Promise<Service> =>
  serviceDB.remove(toDocument(service))
    .then(() => service);
