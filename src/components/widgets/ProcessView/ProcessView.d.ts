type ProcessViewPartType =
  'TUBE_STRAIGHT' |
  'TUBE_INPUT' |
  'TUBE_OUTPUT' |
  'TUBE_TEE' |
  'TUBE_ELBOW';

type ProcessViewPart = {
  type: ProcessViewPartType;
  x: number;
  y: number;
  rotate: number;
  flowingTo?: number[];
  flipped?: boolean;
};

type ProcessViewPartFlows = {
  [angleIn: number]: number[];
};

type ProcessViewPartWithComponent = {
  component: {
    isSource?: boolean;
    isSink?: boolean;
    flows: () => ProcessViewPartFlows;
  };
} & ProcessViewPart;
