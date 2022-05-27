import { StoreObject } from '@/shared-types';

/**
 * Persistent data for dashboard widgets.
 */
export interface Widget<ConfigT = any> extends StoreObject {
  /**
   * Unique ID. Will not be shown to users.
   */
  id: string;

  /**
   * Human-friendly display name. Does not have to be unique.
   */
  title: string;

  /**
   * Widget width when shown in a dashboard grid.
   * This value is ignored in dense mode and dialogs.
   */
  cols: number;

  /**
   * Widget height when shown in a dashboard grid.
   * This value is ignored in dense mode and dialogs.
   */
  rows: number;

  /**
   * X/Y position when pinned in a dashboard grid.
   * This value is ignored in dense mode and dialogs.
   *
   * When null, widget position is based on order,
   * and size of screen and adjacent widgets.
   */
  pinnedPosition?: XYPosition | null;

  /**
   * Sorting order among other widgets on the same dashboard.
   */
  order: number;

  /**
   * Parent dashboard ID.
   */
  dashboard: string;

  /**
   * Foreign key to `WidgetFeature.id`
   */
  feature: string;

  /**
   * Configuration data. Can be freely used by the widget itself.
   * Will only be used by the controlling WidgetFeature
   */
  config: ConfigT;

  /**
   * Flag for widgets that should not be persisted to the datastore.
   */
  volatile?: true;
}
