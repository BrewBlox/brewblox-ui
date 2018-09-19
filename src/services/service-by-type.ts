import { services } from './';

export const allServiceTypes = () => Object.keys(services);

export const serviceByType = (type: string) =>
  (services[type] || {});

export const displayNameByType = (type: string) =>
  serviceByType(type).displayName || type;

export const validatorByType = (type: string) =>
  serviceByType(type).validator || (() => true);

export const registerByType = (type: string) =>
  serviceByType(type).register || (() => { });

export const fetchByType = (type: string) =>
  serviceByType(type).fetch || (() => { });

export const wizardByType = (type: string) =>
  serviceByType(type).wizard;

export const pageByType = (type: string) =>
  serviceByType(type).page;

export const featuresByType = (type: string) =>
  serviceByType(type).features;
