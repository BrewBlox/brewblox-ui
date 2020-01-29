import { Widget } from '@/store/dashboards';
import { Service } from '@/store/services';

export type WidgetRole = 'Process' | 'Control' | 'Output' | 'Constraint' | 'Display' | 'Other';
export type WidgetMode = 'Basic' | 'Full';
export type WidgetContainer = 'Dashboard' | 'Dialog';
export type WidgetSize = 'Fixed' | 'Content';

export interface Crud<ConfigT = any> {
  widget: Widget<ConfigT>;
  isStoreWidget: boolean;
  saveWidget(widget: Widget): unknown | Promise<unknown>;
  closeDialog(): void;
}

export interface WidgetContext {
  mode: WidgetMode;
  container: WidgetContainer;
  size: WidgetSize;
}

type ServiceFunc = (service: Service) => any | Promise<any>;

export interface ServiceFeature {
  id: string;
  title: string;
  onAdd: ServiceFunc;
  onRemove?: ServiceFunc;
  onFetch?: ServiceFunc;
  wizard?: string;
  page?: string;
  widgetFeatures: string[];
}

export interface Deleter {
  description: string;
  action: (crud: Crud) => void;
}

export interface WidgetFeature {
  id: string;
  title: string;
  role?: WidgetRole;
  deleters?: Deleter[];
  widgetSize: GridSize;
  widgetComponent: (crud: Crud) => string;
  wizardComponent?: string | null;
  generateConfig?: () => any;
}

export interface QuickStartFeature {
  id: string;
  title: string;
  wizardComponent: string;
}

export interface WatcherFeature {
  id: string;
  component: string;
  props: Mapped<any>;
}
