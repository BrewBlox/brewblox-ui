export interface StoreObject {
  id: string;
  namespace?: string;
  _rev?: string;
}

export type ChangeCb<T> = (obj: T) => unknown;
export type DeleteCb = (id: string) => unknown;

export interface EventHandler<T = StoreObject> {
  id: string;
  onChanged: ChangeCb<T>;
  onDeleted: DeleteCb;
}

export interface BrewbloxDatabase {

  /**
   * Perform startup functionality.
   * Is registered as BrewbloxStartup handler.
   */
  start(): void;

  /**
   * Be notified of external changes to a collection.
   *
   * @param handler Object containing callbacks
   */
  subscribe(handler: EventHandler): void;

  /**
   * Fetch all documents from the collection where ID is `moduleId`
   *
   * @param moduleId collection identifier.
   */
  fetchAll<T extends StoreObject>(moduleId: string): Promise<T[]>;

  /**
   * Fetch a single document.
   *
   * @param moduleId collection ID.
   * @param objId unique document ID.
   */
  fetchById<T extends StoreObject>(moduleId: string, objId: string): Promise<T>;

  /**
   * Save a new document to the store.
   *
   * @param moduleId collection ID.
   * @param obj document. Its ID should be unique. Its _rev field will be reset.
   */
  create<T extends StoreObject>(moduleId: string, obj: T): Promise<T>;

  /**
   * Save an already created document.
   *
   * @param moduleId collection ID.
   * @param obj existing document in the database.
   * `obj._rev` should match that of the currently stored document.
   */
  persist<T extends StoreObject>(moduleId: string, obj: T): Promise<T>;

  /**
   * Remove an existing document from the store.
   *
   * @param moduleId collection ID.
   * @param obj existing document in the database.
   * `obj._rev` should match that of the currently stored document.
   */
  remove<T extends StoreObject>(moduleId: string, obj: T): Promise<T>;
}
