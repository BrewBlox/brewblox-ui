/**
 * @pattern ^[0-9a-fA-F\-]{36}$
 */
export type UUID = string;

/**
 * The default config notation for celsius/fahrenheit.
 */
export type TempUnit = 'degC' | 'degF';

/**
 * Required fields for an object to be stored in the datastore.
 */
export interface StoreObject {
  id: UUID;
  namespace?: string; // Redis namespace
}

// #region DatastoreEvent
export interface DatastoreEvent {
  changed?: StoreObject[];
  deleted?: string[];
}
// #endregion DatastoreEvent
