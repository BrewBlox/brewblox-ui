import { allServices } from './';

export const allServiceTypes = Object.keys(allServices);

export const serviceByType = (type: string) =>
  (allServices[type] || {});

export const fetchByType = (type: string) =>
  serviceByType(type).fetch || (() => { });

export const validatorByType = (type: string) =>
  serviceByType(type).validator || (() => true);
