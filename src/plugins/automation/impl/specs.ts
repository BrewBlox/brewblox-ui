import { ActionImpl, AutomationSpec, ConditionImpl } from '../types';
import BlockPatch from './BlockPatch';
import BlockValue from './BlockValue';
import TaskCreate from './TaskCreate';
import TaskStatus from './TaskStatus';
import TimeAbsolute from './TimeAbsolute';
import TimeElapsed from './TimeElapsed';

export const actionSpecs: Mapped<AutomationSpec<ActionImpl>> = {
  BlockPatch,
  TaskCreate,
};

export const conditionSpecs: Mapped<AutomationSpec<ConditionImpl>> = {
  BlockValue,
  TaskStatus,
  TimeAbsolute,
  TimeElapsed,
};

export const allSpecs: Mapped<AutomationSpec> = {
  ...actionSpecs,
  ...conditionSpecs,
};
