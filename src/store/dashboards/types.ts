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
   * Sorting order among other dashboards.
   */
  order: number;

  /**
   * Whether the dashboard is shown in the sidebar. Defaults to true.
   */
  listed?: boolean;

  /**
   * Dashboards are rendered in a tree structure.
   * Directories do not have to be created.
   * They will be present if present in at least one Dashboard path.
   * Values are /-separated, and are not used in routing.
   */
  path?: string;
}
