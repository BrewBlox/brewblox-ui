import { RootStore } from '@/store/state';

import { serviceById } from '@/store/services/getters';

import { SparkService } from './state';

const defaultProfileNames = [
  'P1',
  'P2',
  'P3',
  'P4',
  'P5',
  'P6',
  'P7',
  'P8',
];

export const typeName = 'SparkService';

export const getById = (store: RootStore, id: string) =>
  serviceById<SparkService>(store, id, typeName);

export const getConfigById = (store: RootStore, id: string) =>
  getById(store, id).config || {};

export const profileNames = (store: RootStore, id: string) => {
  const configNames = getConfigById(store, id).profileNames || [];
  return [
    ...configNames.slice(0, defaultProfileNames.length),
    ...defaultProfileNames.slice(configNames.length),
  ];
};
