
export interface StepAction {
  id: string;
  type: string;
  enabled: boolean;
  opts: Mapped<any>;
}

export interface StepCondition {
  id: string;
  type: string;
  enabled: boolean;
  opts: Mapped<any>;
}

export interface StepNote {
  id: string;
  title: string;
  message: string;
}

export interface ProcessStep {
  id: string;
  title: string;
  enabled: boolean;
  actions: StepAction[];
  conditions: StepCondition[];
  notes: StepNote[];
}

export interface Process {
  id: string;
  title: string;
  steps: ProcessStep[];
  _rev?: string;
}

export interface RuntimeLog {
  timestamp: number;
  source: string;
  ref: string;
  message: string;
}

export interface RuntimeTask {
  ref: string;
  title: string;
  message: string;
  done: boolean;
}

export interface RuntimeResult {
  id: string;
  title: string;
  step: string;
  start: number | null;
  end: number | null;
  logs: RuntimeLog[];
}

export interface Runtime {
  id: string;
  title: string;
  start: number | null;
  end: number | null;
  process: Process;
  tasks: RuntimeTask[];
  results: RuntimeResult[];
  conditions?: boolean[];
}

export type CompareOperator = 'lt' | 'le' | 'eq' | 'ne' | 'ge' | 'gt';

export type StepperConfig = {};
