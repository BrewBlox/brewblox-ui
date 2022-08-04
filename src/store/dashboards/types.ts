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
   * Dashboards are rendered in a tree structure,
   * and can be placed in a folder.
   */
  parentFolder?: string | null;
}
