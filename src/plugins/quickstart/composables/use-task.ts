import { QuickstartAction, QuickstartConfig } from '@/plugins/quickstart/types';

export interface UseTaskProps<ConfigT extends QuickstartConfig> {
  config: ConfigT;
  actions: QuickstartAction[];
}

export type UseTaskEmits<ConfigT extends QuickstartConfig> = {
  'update:config': [payload: ConfigT];
  'update:actions': [payload: QuickstartAction[]];
  back: [];
  next: [];
  close: [];
};
