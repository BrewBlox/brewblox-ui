type ProcessViewPartType =
  'TUBE_STRAIGHT' |
  'TUBE_INPUT' |
  'TUBE_OUTPUT' |
  'TUBE_TEE' |
  'TUBE_ELBOW' |
  'VALVE';

interface ProcessViewPart {
  type: ProcessViewPartType;
  x: number;
  y: number;
  rotate: number;
  closed?: boolean;
}

interface ProcessViewPartFlow {
  out: number,
  friction?: number,
  pressure?: number,
}

interface ProcessViewPartFlows {
  [angleIn: number]: ProcessViewPartFlow[];
}

interface ProcessViewComponent extends ProcessViewPart {
  isSource?: boolean;
  isSink?: boolean;
  flows: (part: ProcessViewPartWithComponent) => ProcessViewPartFlows;
}

interface ProcessViewPartCalculatedFlow {
  [angle: number]: number;
}

interface ProcessViewPartWithComponent extends ProcessViewPart {
  component: ProcessViewComponent;
  flow?: ProcessViewPartCalculatedFlow;
  visited?: boolean;
}

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

interface HoldArguments {
  evt: MouseEvent | TouchEvent;
  position: {
    top: number;
    left: number;
  };
  duration: number;
}
