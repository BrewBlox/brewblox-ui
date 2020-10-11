export * from '@/shared-types/automation-types';

import { VueConstructor } from 'vue';

import { AutomationImpl } from '@/shared-types/automation-types';

export type Section = 'Preconditions' | 'Actions' | 'Transitions';

export interface AutomationSpec<T extends AutomationImpl = AutomationImpl> {
  type: T['type'];
  title: string;
  generate: () => T;
  pretty: (impl: AutomationImpl) => string;
  component: VueConstructor;
  hidden?: boolean;
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface AutomationConfig { }
