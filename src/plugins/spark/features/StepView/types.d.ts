export interface StepViewConfig {
  serviceId: string;
  steps: Step[];
}

export interface ChangeProperty {
  key: string;
  title: string;
  component: string;
  generate: () => any;
}

export interface BlockChange {
  blockId: string;
  data: {
    [key: string]: any;
  };
}

export interface Step {
  id: string;
  name: string;
  changes: BlockChange[];
}
