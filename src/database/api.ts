import { StoreObject } from 'brewblox-proto/ts';
import { database } from '@/database';
import { deserialize } from '@/utils/parsing';
import { ChangeCb, DeleteCb } from './types';

export interface DatabaseApi<T extends StoreObject> {
  subscribe(onChanged: ChangeCb<T>, onDeleted: DeleteCb): void;
  fetch(): Promise<T[]>;
  fetchById(id: string): Promise<T | null>;
  create(obj: T): Promise<T>;
  persist(obj: T): Promise<T>;
  persistMult(objs: T[]): Promise<T[]>;
  remove(obj: T): Promise<T>;
}

export interface DatabaseApiArgs {
  /**
   * Collection identifier.
   */
  namespace: string;

  /**
   * Should incoming data be deserialized?
   * Defaults to false.
   */
  parsed?: boolean;
}

export function createApi<T extends StoreObject>(
  args: DatabaseApiArgs,
): DatabaseApi<T> {
  const hydrate: (v: any) => any = args.parsed ? deserialize : (v) => v;
  const { namespace } = args;
  return {
    subscribe(onChanged: ChangeCb<T>, onDeleted: DeleteCb): void {
      database.subscribe({
        namespace,
        onChanged: (v) => onChanged(hydrate(v)),
        onDeleted,
      });
    },
    async fetch(): Promise<T[]> {
      return hydrate(await database.fetchAll(namespace));
    },
    async fetchById(id: string): Promise<T | null> {
      return hydrate(await database.fetchById(namespace, id));
    },
    async create(val: T): Promise<T> {
      return hydrate(await database.create(namespace, val));
    },
    async persist(val: T): Promise<T> {
      return hydrate(await database.persist(namespace, val));
    },
    async persistMult(vals: T[]): Promise<T[]> {
      const result = await database.persistMult(namespace, vals);
      return result.map(hydrate);
    },
    async remove(val: T): Promise<T> {
      return hydrate(await database.remove(namespace, val));
    },
  };
}
