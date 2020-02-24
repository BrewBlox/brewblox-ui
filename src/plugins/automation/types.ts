import { StoreObject } from '@/plugins/database';

export type AutomationStatus = 'Created' | 'Started' | 'Done' | 'Cancelled' | 'Unknown';

/** @nullable */
type Datum = Date | number | null;

// Conditions
////////////////

export interface TimeAbsoluteImpl {
  type: 'TimeAbsolute';
  time: number | Date;
}

export interface TimeElapsedImpl {
  type: 'TimeElapsed';
  duration: number;
}

export interface BlockValueImpl {
  type: 'BlockValue';
  blockId: string;
  serviceId: string;
  blockType: string;
  key: string;
  operator: 'lt' | 'le' | 'eq' | 'ne' | 'ge' | 'gt';
  value: any;
}

export interface TaskStatusImpl {
  type: 'TaskStatus';
  ref: string;
  status: AutomationStatus;
}

export interface ManualAdvanceImpl {
  type: 'ManualAdvance';
  desc: string;
}

export type ConditionImpl =
  TimeAbsoluteImpl
  | TimeElapsedImpl
  | BlockValueImpl
  | TaskStatusImpl
  | ManualAdvanceImpl
  ;

// Actions
/////////////

export interface BlockPatchImpl {
  type: 'BlockPatch';
  blockId: string;
  serviceId: string;
  blockType: string;
  data: any;
}

export interface TaskCreateImpl {
  type: 'TaskCreate';
  ref: string;
  title: string;
  message: string;
}

export type ActionImpl =
  BlockPatchImpl
  | TaskCreateImpl
  ;

// Generic
//////////////

export interface AutomationAction<T extends ActionImpl = ActionImpl> {
  id: string;
  title: string;
  enabled: boolean;
  impl: T;
}

export interface AutomationCondition<T extends ConditionImpl = ConditionImpl> {
  id: string;
  title: string;
  enabled: boolean;
  impl: T;
}

export interface AutomationNote {
  id: string;
  title: string;
  message: string;
}

export interface AutomationStep {
  id: string;
  title: string;
  enabled: boolean;
  actions: AutomationAction[];
  conditions: AutomationCondition[];
  notes: AutomationNote[];
}

export interface AutomationStepResult {
  id: string;
  title: string;
  stepId: string;
  start: Datum;
  end: Datum;
  status: AutomationStatus;
}

export interface AutomationTask extends StoreObject {
  ref: string;
  title: string;
  message: string;
  status: AutomationStatus;
  source?: {
    runtimeId: string;
    stepId: string;
  };
}

export interface AutomationTemplate extends StoreObject {
  title: string;
  steps: AutomationStep[];
}

export interface AutomationProcess extends AutomationTemplate {
  start: Datum;
  end: Datum;
  status: AutomationStatus;
  results: AutomationStepResult[];
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface AutomationConfig { }
