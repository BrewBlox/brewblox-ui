import { QuickstartAction, QuickstartConfig } from '@/plugins/quickstart/types';

export interface UseTaskProps<ConfigT extends QuickstartConfig> {
  config: ConfigT;
  actions: QuickstartAction[];
}

export type UseTaskEmits<ConfigT extends QuickstartConfig> = {
  'update:config': [data: ConfigT];
  'update:actions': [data: QuickstartAction[]];
  back: [];
  next: [];
  close: [];
};
