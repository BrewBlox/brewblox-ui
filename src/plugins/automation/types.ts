import { VueConstructor } from 'vue';

import { AutomationImpl } from './shared-types';
export * from './shared-types';


export interface AutomationSpec<T extends AutomationImpl = AutomationImpl> {
  type: T['type'];
  title: string;
  generate: () => T;
  component: VueConstructor;
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface AutomationConfig { }
