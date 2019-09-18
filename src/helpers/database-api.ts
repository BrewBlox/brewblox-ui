import database, { StoreObject } from '@/plugins/database';

type ChangeCallback = (doc: any) => void;
type DeleteCallback = (id: string) => void;

export type DatabaseApi<T> = {
  setup(onChanged: ChangeCallback, onDeleted: DeleteCallback): void;
  fetch(): Promise<T[]>;
  fetchById(id: string): Promise<T>;
  create(val: T): Promise<T>;
  persist(val: T): Promise<T>;
  remove(val: T): Promise<T>;
}

export function generate<T extends StoreObject>(moduleId: string): DatabaseApi<T> {
  return {
    setup(onChanged: ChangeCallback, onDeleted: DeleteCallback): void {
      database.registerModule({ id: moduleId, onChanged, onDeleted });
    },
    async fetch(): Promise<T[]> {
      return database.fetchAll(moduleId);
    },
    async fetchById(id: string): Promise<T> {
      return database.fetchById(moduleId, id);
    },
    async create(val: T): Promise<T> {
      return database.create(moduleId, val);
    },
    async persist(val: T): Promise<T> {
      return database.persist(moduleId, val);
    },
    async remove(val: T): Promise<T> {
      return database.remove(moduleId, val);
    },
  };
}
