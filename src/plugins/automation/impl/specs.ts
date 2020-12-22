import { ActionImpl, AutomationSpec, ConditionImpl } from '../types';
import BlockPatch from './BlockPatch';
import BlockValue from './BlockValue';
import JSApply from './JSApply';
import JSCheck from './JSCheck';
import TaskEdit from './TaskEdit';
import TaskStatus from './TaskStatus';
import TimeAbsolute from './TimeAbsolute';
import TimeElapsed from './TimeElapsed';
import Webhook from './Webhook';

export const actionSpecs: Record<ActionImpl['type'], AutomationSpec<ActionImpl>> = {
  BlockPatch,
  JSApply,
  TaskEdit,
  Webhook,
};

export const conditionSpecs: Record<ConditionImpl['type'], AutomationSpec<ConditionImpl>> = {
  BlockValue,
  JSCheck,
  TaskStatus,
  TimeAbsolute,
  TimeElapsed,
};

export const allSpecs: Mapped<AutomationSpec> = {
  ...actionSpecs,
  ...conditionSpecs,
};
