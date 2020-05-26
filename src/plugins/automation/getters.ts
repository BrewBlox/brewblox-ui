import { AutomationTask } from './types';

export const AutomationEvent = 'Automation.active';

export const settableStates: { status: AutomationTask['status'] }[] = [
  { status: 'Created' },
  { status: 'Active' },
  { status: 'Retrying' },
  { status: 'Paused' },
  { status: 'Finished' },
  { status: 'Cancelled' },
];
