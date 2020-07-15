export * from './shared-types';

import { VueConstructor } from 'vue';

import { AutomationImpl } from './shared-types';

export type SnippetApply = (v: string | string[]) => void;

export interface JSSnippetFactory {
  desc: string;
  func(insert: SnippetApply, append: SnippetApply): void | Promise<void>;
}

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
