import { ActionImpl, AutomationSpec, ConditionImpl } from '../types';
import BlockPatch from './BlockPatch';
import BlockValue from './BlockValue';
import TaskEdit from './TaskEdit';
import TaskStatus from './TaskStatus';
import TimeAbsolute from './TimeAbsolute';
import TimeElapsed from './TimeElapsed';
import UserScript from './UserScript';
import Webhook from './Webhook';

export const actionSpecs: Record<ActionImpl['type'], AutomationSpec<ActionImpl>> = {
  BlockPatch,
  TaskEdit,
  Webhook,
};

export const conditionSpecs: Record<ConditionImpl['type'], AutomationSpec<ConditionImpl>> = {
  BlockValue,
  TaskStatus,
  TimeAbsolute,
  TimeElapsed,
  UserScript,
};

export const allSpecs: Mapped<AutomationSpec> = {
  ...actionSpecs,
  ...conditionSpecs,
};
