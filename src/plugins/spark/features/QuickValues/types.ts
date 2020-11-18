import { BlockFieldAddress } from '@/plugins/spark/types';
import { Widget } from '@/store/dashboards';

export interface QuickValuesConfig {
  addr: BlockFieldAddress;
  values: number[];
  sliders: number[][];
}

export type QuickValuesWidget = Widget<QuickValuesConfig>;
