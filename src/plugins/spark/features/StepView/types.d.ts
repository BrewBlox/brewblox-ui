export interface StepViewConfig {
  serviceId: string;
  steps: Step[];
}

export type BlockDataType =
  'number' |
  'string' |
  'boolean' |
  'Unit';

export interface BlockProperty {
  key: string;
  title: string;
  description?: string;
  type: BlockDataType;
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
