import { StoreObject } from 'brewblox-proto/ts';

export type ChangeCb<T> = (obj: T) => unknown;
export type DeleteCb = (id: string) => unknown;

export interface EventHandler<T = StoreObject> {
  namespace: string;
  onChanged: ChangeCb<T>;
  onDeleted: DeleteCb;
}

export interface BrewbloxDatabase {
  /**
   * Connect to actual database.
   * Is called by App.vue during create
   */
  connect(): Awaitable<void>;

  /**
   * Be notified of external changes to a collection.
   *
   * @param handler Object containing callbacks
   */
  subscribe(handler: EventHandler): void;

  /**
   * Fetch all documents from the collection with matching namespace.
   *
   * @param namespace collection identifier.
   */
  fetchAll<T extends StoreObject>(namespace: string): Promise<T[]>;

  /**
   * Fetch a single document.
   *
   * @param namespace collection ID.
   * @param objId unique document ID.
   */
  fetchById<T extends StoreObject>(
    namespace: string,
    objId: string,
  ): Promise<T | null>;

  /**
   * Save a new document to the store.
   *
   * @param namespace collection ID.
   * @param obj document. Its ID should be unique.
   */
  create<T extends StoreObject>(namespace: string, obj: T): Promise<T>;

  /**
   * Save an already created document.
   *
   * @param namespace collection ID.
   * @param obj existing document in the database.
   */
  persist<T extends StoreObject>(namespace: string, obj: T): Promise<T>;

  /**
   * Save multiple documents
   *
   * @param namespace collection ID
   * @param objs existing documents in the database
   */
  persistMult<T extends StoreObject>(
    namespace: string,
    objs: T[],
  ): Promise<T[]>;

  /**
   * Remove an existing document from the store.
   *
   * @param namespace collection ID.
   * @param obj existing document in the database.
   */
  remove<T extends StoreObject>(namespace: string, obj: T): Promise<T>;
}
