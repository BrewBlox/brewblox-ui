import { VueConstructor } from 'vue';

export interface Flow {
  out: number,
  friction?: number,
  pressure?: number,
}

export interface AngledFlows {
  [angleIn: number]: Flow[];
}

export interface CalculatedFlow {
  [angle: number]: number;
}

export interface Part {
  type: string;
  x: number;
  y: number;
  rotate: number;
  closed?: boolean;
}

export interface ComponentConstructor extends VueConstructor {
  isSource?: boolean;
  isSink?: boolean;
  flows: (part: DisplayPart) => AngledFlows;
}

export interface DisplayPart extends Part {
  component: ComponentConstructor;
  flow?: CalculatedFlow;
  visited?: boolean;
}

export interface ProcessViewConfig {
  parts: Part[];
}

export interface PanArguments {
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

export interface HoldArguments {
  evt: MouseEvent | TouchEvent;
  position: {
    top: number;
    left: number;
  };
  duration: number;
}
