type ProcessViewPartType =
  'TUBE_STRAIGHT' |
  'TUBE_INPUT' |
  'TUBE_OUTPUT' |
  'TUBE_TEE' |
  'TUBE_ELBOW' |
  'VALVE';

type ProcessViewPart = {
  type: ProcessViewPartType;
  x: number;
  y: number;
  rotate: number;
  flowingFrom?: number[];
  flowingTo?: number[];
  flipped?: boolean;
};

type ProcessViewPartFlows = {
  [angleIn: number]: {
    out: number,
    friction?: number,
    pressure?: number,
  }[];
};

type ProcessViewPartWithComponent = {
  component: {
    isSource?: boolean;
    isSink?: boolean;
    flows: () => ProcessViewPartFlows;
  };
  visited?: boolean;
} & ProcessViewPart;

type ProcessViewPartWithFlow = {
  flowingFrom: number[];
  flowingTo: number[];
  friction: number;
} & ProcessViewPartWithComponent;
