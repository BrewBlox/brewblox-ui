import { VueConstructor } from 'vue';
import { ActionContext } from 'vuex';
import { RootStore, State as RootState } from '@/store/state';
import { Service } from '@/store/services/state';

export interface Feature {
  displayName?: string;
  validator?: (store: RootStore, config: any) => boolean;
  widget?: VueConstructor;
  widgetSize?: {
    cols: number;
    rows: number;
  };
  wizard?: VueConstructor;
  form?: VueConstructor;
}

export interface FeatureService {
  fetch?: (store: RootStore, service: Service) => any;
  validator?: (store: RootStore, config: any) => boolean;
  widget?: VueConstructor;
  features: {
    [id: string]: Feature;
  }
}
