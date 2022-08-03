import { StoreObject } from 'brewblox-proto/ts';

/**
 * Persistent data for dashboard objects.
 */
export interface Dashboard extends StoreObject {
  /**
   * Unique ID. Must be URL-safe, as it is used in routing.
   */
  id: string;

  /**
   * Human-friendly display name. Does not have to be unique.
   */
  title: string;

  /**
   * Dashboards are rendered in a tree structure.
   * Directories do not have to be created.
   * They will be present if present in at least one Dashboard dir.
   * Values are /-separated, and are not used in routing.
   */
  dir?: string | null;
}
