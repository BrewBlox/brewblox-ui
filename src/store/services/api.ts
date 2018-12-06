import { createDatabase, fromDocument, toDocument } from '@/helpers/database';
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
  serviceDB.put(toDocument(service))
    .then(resp => ({ ...service, _rev: resp.rev }));

export const updateService = async (service: Service): Promise<Service> =>
  serviceDB.put(toDocument(service))
    .then(resp => ({ ...service, _rev: resp.rev }));

export const deleteService = async (service: Service): Promise<Service> =>
  serviceDB.remove(toDocument(service))
    .then(() => service);

// import { del, get, post, put } from '@/helpers/fetch';
// import { Service } from './state';

// export const fetchServices = async (): Promise<Service[]> =>
//   get('/datastore/services');

// export const fetchServiceById = async (id: string): Promise<Service> =>
//   get(`/datastore/services/${encodeURIComponent(id)}`);

// export const createService = async (service: Service): Promise<Service> =>
//   post('/datastore/services', service);

// export const updateService = async (service: Service): Promise<Service> =>
//   put(`/datastore/services/${encodeURIComponent(service.id)}`, service);

// export const deleteService = async (service: Service): Promise<Service> =>
//   del(`/datastore/services/${encodeURIComponent(service.id)}`, service);
