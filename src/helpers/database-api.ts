import database, { StoreObject } from '@/plugins/database';

import { deserialize, serialize } from './units/parseObject';

type ChangeCallback = (doc: any) => void;
type DeleteCallback = (id: string) => void;

export interface DatabaseApi<T> {
  setup(onChanged: ChangeCallback, onDeleted: DeleteCallback): void;
  fetch(): Promise<T[]>;
  fetchById(id: string): Promise<T>;
  create(val: T): Promise<T>;
  persist(val: T): Promise<T>;
  remove(val: T): Promise<T>;
}

export function generate<T extends StoreObject>(moduleId: string, serialized = false): DatabaseApi<T> {
  const hydrate: ((v: any) => any) = serialized ? deserialize : (v => v);
  const dehydrate: ((v: any) => any) = serialized ? serialize : (v => v);
  return {
    setup(onChanged: ChangeCallback, onDeleted: DeleteCallback): void {
      database.registerModule({
        id: moduleId,
        onChanged: v => onChanged(hydrate(v)),
        onDeleted,
      });
    },
    async fetch(): Promise<T[]> {
      return hydrate(await database.fetchAll(moduleId));
    },
    async fetchById(id: string): Promise<T> {
      return hydrate(await database.fetchById(moduleId, id));
    },
    async create(val: T): Promise<T> {
      return hydrate(await database.create(moduleId, dehydrate(val)));
    },
    async persist(val: T): Promise<T> {
      return hydrate(await database.persist(moduleId, dehydrate(val)));
    },
    async remove(val: T): Promise<T> {
      return hydrate(await database.remove(moduleId, dehydrate(val)));
    },
  };
}
