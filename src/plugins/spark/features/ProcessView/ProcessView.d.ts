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
  closed?: boolean;
};

type ProcessViewPartFlow = {
  out: number,
  friction?: number,
  pressure?: number,
};

type ProcessViewPartFlows = {
  [angleIn: number]: ProcessViewPartFlow[];
};

type ProcessViewComponent = {
  isSource?: boolean;
  isSink?: boolean;
  flows: (part: ProcessViewPartWithComponent) => ProcessViewPartFlows;
};

type ProcessViewPartCalculatedFlow = { [angle: number]: number };

type ProcessViewPartWithComponent = {
  component: ProcessViewComponent;
  flow?: ProcessViewPartCalculatedFlow;
  visited?: boolean;
} & ProcessViewPart;

interface ProcessViewConfig {
  parts: ProcessViewPart[];
}

interface PanArguments {
  evt: MouseEvent | TouchEvent;
  position: {
    top: number;
    left: number;
  };
  direction: 'left' | 'right' | 'up' | 'down';
  duration: number;
  distance: {
    x: number;
    y: number;
  };
  delta: {
    x: number;
    y: number;
  };
  isFirst: boolean;
  isFinal: boolean;
}
