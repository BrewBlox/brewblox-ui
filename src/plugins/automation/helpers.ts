import { uid } from 'quasar';

import { findById } from '@/helpers/functional';

import { AutomationTemplate, AutomationTransition } from './shared-types';

export function idCopy<T extends HasId>(v: T): T {
  return {
    ...v,
    id: uid(),
  };
}

export function nextTitle(template: AutomationTemplate, transition: AutomationTransition): string {
  return typeof transition.next === 'string'
    ? findById(template.steps, transition.next)?.title ?? 'Unknown step'
    : transition.next
      ? '[Next step]'
      : '[Process end]';
}
