import { VueConstructor } from 'vue';
import { RootStore } from '@/store/state';

export interface Feature {
  widget?: VueConstructor;
  widgetSize?: {
    cols: number;
    rows: number;
  };
  validator?: (store: RootStore, config: any) => boolean;
  wizard?: VueConstructor;
  form?: VueConstructor;
  displayName?: string;
}
