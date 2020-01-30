import Vue from 'vue';

import { deserialize, serialize } from '@/helpers/units/parseObject';

import { ChangeCb, DeleteCb, StoreObject } from './types';

export interface DatabaseApi<T extends StoreObject> {
  subscribe(onChanged: ChangeCb<T>, onDeleted: DeleteCb): void;
  fetch(): Promise<T[]>;
  fetchById(id: string): Promise<T>;
  create(obj: T): Promise<T>;
  persist(obj: T): Promise<T>;
  remove(obj: T): Promise<T>;
}

export function createApi<T extends StoreObject>(moduleId: string, serialized = false): DatabaseApi<T> {
  const hydrate: ((v: any) => any) = serialized ? deserialize : (v => v);
  const dehydrate: ((v: any) => any) = serialized ? serialize : (v => v);
  return {
    subscribe(onChanged: ChangeCb<T>, onDeleted: DeleteCb): void {
      Vue.$database.subscribe({
        id: moduleId,
        onChanged: v => onChanged(hydrate(v)),
        onDeleted,
      });
    },
    async fetch(): Promise<T[]> {
      return hydrate(await Vue.$database.fetchAll(moduleId));
    },
    async fetchById(id: string): Promise<T> {
      return hydrate(await Vue.$database.fetchById(moduleId, id));
    },
    async create(val: T): Promise<T> {
      return hydrate(await Vue.$database.create(moduleId, dehydrate(val)));
    },
    async persist(val: T): Promise<T> {
      return hydrate(await Vue.$database.persist(moduleId, dehydrate(val)));
    },
    async remove(val: T): Promise<T> {
      return hydrate(await Vue.$database.remove(moduleId, dehydrate(val)));
    },
  };
}
