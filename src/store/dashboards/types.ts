import { StoreObject } from '@/shared-types';

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
}
