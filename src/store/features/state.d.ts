import { RootState, RootStore } from '@/store/state';
import { ActionContext } from 'vuex';

export interface Deleter {
  description: string;
  action: (store: RootStore, config: any) => void;
}

export type Validator = (store: RootStore, config: any) => boolean;
export type WidgetSelector = (store: RootStore, config: any) => string | undefined;

export interface Feature {
  id: string;
  displayName?: string;
  validator?: Validator;
  deleters?: Deleter[];
  widgetSize?: {
    cols: number;
    rows: number;
  };
  widget?: string;
  selector?: WidgetSelector;
  wizard?: string;
  form?: string;
}

export interface FeatureState {
  features: {
    [id: string]: Feature;
  };
}

export type FeatureContext = ActionContext<FeatureState, RootState>;
