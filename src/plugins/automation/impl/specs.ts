import { ActionImpl, AutomationSpec, ConditionImpl } from '../types';
import AlwaysFalse from './AlwaysFalse';
import BlockPatch from './BlockPatch';
import BlockValue from './BlockValue';
import TaskCreate from './TaskCreate';
import TaskStatus from './TaskStatus';
import TimeAbsolute from './TimeAbsolute';
import TimeElapsed from './TimeElapsed';

export const actionSpecs: Record<ActionImpl['type'], AutomationSpec<ActionImpl>> = {
  BlockPatch,
  TaskCreate,
};

export const conditionSpecs: Record<ConditionImpl['type'], AutomationSpec<ConditionImpl>> = {
  AlwaysFalse,
  BlockValue,
  TaskStatus,
  TimeAbsolute,
  TimeElapsed,
};

export const allSpecs: Mapped<AutomationSpec> = {
  ...actionSpecs,
  ...conditionSpecs,
};
