/**
 * @pattern ^[0-9a-fA-F\-]{36}$
 */
export type UUID = string;

/**
 * The notation for temperature units.
 */
export type TempUnit =
  | 'degC' // Celsius
  | 'degF'; // Fahrenheit

/**
 * The notation for specific gravity units.
 */
export type GravityUnit =
  | 'G' // Specific gravity (technically dimensionless, but we need something)
  | 'degP'; // Plato

/**
 * Required fields for an object to be stored in the datastore.
 */
export interface StoreObject {
  id: UUID;
  namespace?: string; // Redis namespace
}

export type StoreObjectImpl<T> = T & StoreObject;

// #region DatastoreEvent
export interface DatastoreEvent {
  changed?: StoreObject[];
  deleted?: string[];
}
// #endregion DatastoreEvent
