
export interface Action {
  type: string;
  opts: Mapped<any>;
}

export interface Condition {
  type: string;
  opts: Mapped<any>;
}

export interface Annotation {
  type: string;
  title: string;
  message: string;
}

export interface Step {
  name: string;
  actions: Action[];
  conditions: Condition[];
  annotations: Annotation[];
}

export interface Process {
  id: string;
  title: string;
  steps: Step[];
}

export interface RuntimeLog {
  timestamp: number;
  source: string;
  ref: string;
  message: string;
}

export interface ResponseResult {
  title: string;
  message: string;
}

export interface RuntimeResult {
  name: string;
  index: number;
  start: number | null;
  end: number | null;
  logs: RuntimeLog[];
}

export interface Runtime {
  id: string;
  start: number | null;
  end: number | null;
  results: RuntimeResult[];
  conditions?: boolean[];
}

export interface ProcessGroup {
  id: string;
  process: Process;
  runtime: Runtime | null;
  current: RuntimeResult | null;
}

export type CompareOperator = 'lt' | 'le' | 'eq' | 'ne' | 'ge' | 'gt';
