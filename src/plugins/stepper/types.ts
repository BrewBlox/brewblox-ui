
export interface Action {
  type: string;
  opts: Mapped<any>;
}

export interface Response {
  type: string;
  opts: Mapped<any>;
}

export interface Condition {
  type: string;
  opts: Mapped<any>;
}

export interface Step {
  name: string;
  actions: Action[];
  responses: Response[];
  conditions: Condition[];
}

export interface Process {
  id: string;
  steps: Step[];
}

export interface RuntimeLog {
  timestamp: number;
  source: string;
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
}

export interface RuntimeStatus {
  id: string;
  responses: ResponseResult[];
  conditions: boolean[];
}
