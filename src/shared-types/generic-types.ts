/**
 * @pattern ^[0-9a-fA-F\-]{36}$
 */
export type UUID = string;

/**
 * Required fields for an object to be stored in the datastore.
 */
export interface StoreObject {
  id: UUID;
  namespace?: string; // Redis namespace
}

// #region StateEvent
export interface StateEvent {
  key: string;
  type: string;
  ttl: string;
  data: unknown;
}
// #endregion StateEvent

// #region DatastoreEvent
export interface DatastoreEvent {
  changed?: StoreObject[];
  deleted?: string[];
}
// #endregion DatastoreEvent
