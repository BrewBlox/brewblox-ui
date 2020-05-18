import { VueConstructor } from 'vue';

import { AutomationImpl } from './shared-types';
export * from './shared-types';


export type Section = 'Preconditions' | 'Actions' | 'Transitions';

export interface AutomationSpec<T extends AutomationImpl = AutomationImpl> {
  type: T['type'];
  title: string;
  generate: () => T;
  pretty: (impl: AutomationImpl) => string;
  component: VueConstructor;
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface AutomationConfig { }
