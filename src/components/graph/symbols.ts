import { PlotData } from 'plotly.js';
import { InjectionKey, ShallowRef } from 'vue';

export const GraphDataKey: InjectionKey<ShallowRef<Partial<PlotData>[]>> =
  Symbol();
