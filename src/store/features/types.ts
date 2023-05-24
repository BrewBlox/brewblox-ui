import { Service, ServiceStub } from '@/store/services/types';
import { Widget } from '@/store/widgets/types';
import { Component, GlobalComponents } from 'vue';

export type ComponentName = keyof GlobalComponents & string;

export type WidgetRole =
  | 'Process'
  | 'Control'
  | 'Output'
  | 'Constraint'
  | 'Display'
  | 'Other';

export type WidgetMode = 'Basic' | 'Full';
export type WidgetContainer = 'Dashboard' | 'Dialog';
export type WidgetSize = 'Fixed' | 'Content';
export type ServiceHook = (service: Service) => Awaitable<unknown>;

export type WidgetModeComponents = Record<WidgetMode, Component>;

export interface GridSize {
  cols: number;
  rows: number;
}

export interface WidgetContext {
  mode: WidgetMode;
  container: WidgetContainer;
  size: WidgetSize;
}

export interface WidgetRemoveAction {
  description: string;
  action: (widget: Widget) => void;
}

/**
 * Widgets are the primary dynamic UI component.
 * They are typically rendered as cards on dashboards.
 */
export interface WidgetFeature<ConfigT = any> {
  /**
   * Unique type ID
   */
  id: string;

  /**
   * Human-friendly display name. Does not have to be unique.
   */
  title: string;

  /**
   * (Optional) Hint for how the widget can be grouped by the UI.
   */
  role?: WidgetRole;

  /**
   * (Optional) Additional actions that can be taken when this widget is removed.
   * User will be prompted to confirm.
   */
  removeActions?: WidgetRemoveAction[];

  /**
   * Default values for size occupied by widgets on dashboards.
   * Not used in dense mode or in dialogs.
   */
  widgetSize: GridSize;

  /**
   * Rendering component for this widget.
   * Should be the name of a globally registered Vue component.
   */
  component: string;

  /**
   * Wrapping component for this widget.
   * Should be the name of a globally registered Vue component.
   * If set, this will be rendered instead of `component`.
   * It is then the wrapper's responsibility to render the actual component.
   */
  wrapperComponent?: ComponentName;

  /**
   * Name of the editor component used during the wizard.
   * If not set, the generic editor component is used.
   */
  editor?: ComponentName;

  /**
   * Should return a new object that can be used as `widget.config`.
   * If not set, the widget is not creatable by users.
   */
  generateConfig?: () => ConfigT;

  /**
   * Is called once per widget on first load to allow for data upgrades.
   * Should return null if no changes are required.
   */
  upgrade?: (widget: Widget<unknown>) => Widget<ConfigT> | null;

  /**
   * Widget is creatable by users.
   * Defaults to true.
   */
  creatable?: boolean;

  /**
   * Wizard should only be shown if experimental features are enabled.
   */
  experimental?: boolean;
}

/**
 * Services are much like Widgets: they allow plugins to render arbitrary content.
 * Where widgets will be shown on a dashboard, services get their own page.
 */
export interface ServiceFeature {
  /**
   * Unique type ID
   */
  id: string;

  /**
   * Human-friendly display name. Does not have to be unique.
   */
  title: string;

  /**
   * (Optional) Name of a globally registered Vue component.
   * Page is expected to use a q-page as root element.
   */
  pageComponent?: string;

  /**
   * (Optional) Name of a globally registered Vue component.
   * configComponent will be mounted in the config page
   */
  configComponent?: string;

  /**
   * Will be called when a service of this type is created or loaded.
   */
  onStart?: ServiceHook;

  /**
   * Will be called when a service of this type is removed from the datastore.
   */
  onRemove?: ServiceHook;

  /**
   * Create a service from the discovered stub.
   */
  generate: (stub: ServiceStub) => Service | PromiseLike<Service>;
}

/**
 * Watchers are 0x0 Vue components that are always active.
 * They allow you to add reactive functions independent of current page/dashboard.
 */
export interface WatcherFeature {
  /**
   * Unique type ID
   */
  id: string;

  /**
   * Name of globally registered Vue component.
   */
  component: string;

  /**
   * Props to be passed to the watcher component.
   */
  props: Mapped<any>;
}

/**
 * Quickstarts are independent wizards.
 * They are not linked to any specific Widget or Service feature.
 * Instead, they may generate any combination of dashboards, widgets, and services.
 */
export interface QuickstartFeature {
  /**
   * Unique type ID
   */
  id: string;

  /**
   * Human-friendly display name. Does not have to be unique.
   */
  title: string;

  /**
   * Names of globally registered Vue component.
   * They are expected to accept props for config and actions,
   * and emit events for config/action updates, along with back/next/close.
   */
  tasks: string[];
}
