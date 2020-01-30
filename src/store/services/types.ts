import { StoreObject } from '@/plugins/database';

/**
 * Persistent data for service objects.
 */
export interface Service<ConfigT = any> extends StoreObject {
  /**
   * Unique ID. Must be URL-safe, as it is used in routing.
   * Typically matches the name of the corresponding backend service.
   */
  id: string;

  /**
   * Human-friendly display name. Does not have to be unique.
   */
  title: string;

  /**
   * Sorting order among other services.
   */
  order: number;

  /**
   * Foreign key to `ServiceFeature.id`
   */
  type: string;

  /**
   * Configuration data. Can be freely used by the service itself.
   * Will only be used by the controlling ServiceFeature
   */
  config: ConfigT;
}
