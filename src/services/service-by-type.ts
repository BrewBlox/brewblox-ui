import { services } from './';

export const allServiceTypes = () => Object.keys(services);

export const serviceByType = (type: string) =>
  (services[type] || {});

export const fetchByType = (type: string) =>
  serviceByType(type).fetch || (() => { });

export const validatorByType = (type: string) =>
  serviceByType(type).validator || (() => true);

export const pageByType = (type: string) =>
  serviceByType(type).page;

export const widgetByType = (type: string) =>
  serviceByType(type).widget;
