import { ActionContext } from 'vuex';
import { RootStore, RootState } from '@/store/state';

export interface Feature {
  id: string;
  displayName?: string;
  validator?: (store: RootStore, config: any) => boolean;
  onDelete?: (store: RootStore, config: any) => void;
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
  initialized: boolean;
};

export type FeatureContext = ActionContext<FeatureState, RootState>;
