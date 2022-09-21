import { findById } from '@/utils/collections';
import { nanoid } from 'nanoid';
import { AutomationTemplate, AutomationTransition } from './types';

export function idCopy<T extends HasId>(v: T): T {
  return {
    ...v,
    id: nanoid(),
  };
}

export function nextTitle(
  template: AutomationTemplate,
  transition: AutomationTransition,
): string {
  return typeof transition.next === 'string'
    ? findById(template.steps, transition.next)?.title ?? 'Unknown step'
    : transition.next
    ? '[Next step]'
    : '[Process end]';
}
