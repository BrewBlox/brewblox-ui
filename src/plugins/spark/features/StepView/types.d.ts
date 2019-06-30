export interface StepViewConfig {
  serviceId: string;
  steps: Step[];
}

export interface BlockChange {
  blockId: string;
  data: {
    [key: string]: any;
  };
  confirmed: {
    [key: string]: boolean;
  };
}

export interface Step {
  id: string;
  name: string;
  changes: BlockChange[];
}
