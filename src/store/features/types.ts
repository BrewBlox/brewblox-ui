import { Widget } from '@/store/dashboards';
import { Service, ServiceStub } from '@/store/services';

export type WidgetRole = 'Process' | 'Control' | 'Output' | 'Constraint' | 'Display' | 'Other';
export type WidgetMode = 'Basic' | 'Full';
export type WidgetContainer = 'Dashboard' | 'Dialog';
export type WidgetSize = 'Fixed' | 'Content';
export type ServiceHook = (service: Service) => any | Promise<any>;

export interface Crud<ConfigT = any> {
  widget: Widget<ConfigT>;
  isStoreWidget: boolean;
  saveWidget(widget: Widget<ConfigT>): unknown | Promise<unknown>;
  closeDialog(): void;
}

export interface WidgetContext {
  mode: WidgetMode;
  container: WidgetContainer;
  size: WidgetSize;
}

export interface WidgetRemoveAction {
  description: string;
  action: (crud: Crud) => void;
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
   * Should be or return the name of a globally registered Vue component.
   */
  component: string | ((crud: Crud) => string);

  /**
   * Wizard component.
   * There are three possible values:
   * - string: the name of a globally registered Vue component.
   * - true: the generic widget wizard component will be used.
   * - false: this widget can not be created by users.
   */
  wizard: boolean | string;

  /**
   * Should return a new object that can be used as `widget.config`.
   * Required if `WidgetFeature.wizard` === true.
   */
  generateConfig?: () => ConfigT;
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
  page?: string;

  /**
   * Will be called when a service of this type is created or loaded.
   */
  onStart?: ServiceHook;

  /**
   * Will be called when a service of this type is removed from the datastore.
   */
  onRemove?: ServiceHook;

  /**
   * Wizard implementation.
   * This can either be the name of a Vue component, or a function.
   *
   * If it's a Vue component, it will be wrapped in WizardDialog,
   * and given the stub as prop.
   */
  wizard: string | ((stub: ServiceStub) => Service | PromiseLike<Service>);
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
 * QuickStarts are independent wizards.
 * They are not linked to any specific Widget or Service feature.
 * Instead, they may generate any combination of dashboards, widgets, and services.
 */
export interface QuickStartFeature {
  /**
   * Unique type ID
   */
  id: string;

  /**
   * Human-friendly display name. Does not have to be unique.
   */
  title: string;

  /**
   * Name of globally registered Vue component.
   * The component is expected to inherit from WidgetWizardBase.
   */
  component: string;
}
