import { AutomationTask } from './types';

export const AutomationEvent = 'automation.active';

export const settableStates: { status: AutomationTask['status'] }[] = [
  { status: 'Created' },
  { status: 'Active' },
  { status: 'Retrying' },
  { status: 'Paused' },
  { status: 'Finished' },
  { status: 'Cancelled' },
];
