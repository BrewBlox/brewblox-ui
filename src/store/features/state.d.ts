import { ActionContext } from 'vuex';
import { RootStore, RootState } from '@/store/state';

export interface Deleter {
  description: string;
  action: (store: RootStore, config: any) => void;
}

export interface Feature {
  id: string;
  displayName?: string;
  validator?: (store: RootStore, config: any) => boolean;
  deleters?: Deleter[];
  widgetSize?: {
    cols: number;
    rows: number;
  };
  widget?: string;
  wizard?: string;
  form?: string;
}

export type FeatureState = {
  features: {
    [id: string]: Feature;
  };
};

export type FeatureContext = ActionContext<FeatureState, RootState>;
