import { VueConstructor } from 'vue';

export interface Flow {
  angleOut: number;
  friction?: number;
  pressure?: number;
  deltaPressure?: number;
}

export interface AngledFlows {
  [angleIn: number]: Flow[];
}

export interface FlowPressure {
  [angleIn: number]: number;  // pressure
}

export interface Part {
  type: string;
  x: number;
  y: number;
  rotate: number;
  liquidSource?: string;
  closed?: boolean;
  disabled?: boolean;
  flipped?: boolean;
}

export interface ComponentConstructor extends VueConstructor {
  isSource: boolean;
  isBridge: boolean;
  cards: string[];
  flows: (part: FlowPart) => AngledFlows;
}

export interface FlowPart extends Part {
  flow?: FlowPressure;
  liquid?: string;
}

export interface ProcessViewConfig {
  parts: Part[];
}

export interface PanArguments {
  evt: MouseEvent | TouchEvent;
  position: { top: number; left: number; };
  direction: 'left' | 'right' | 'up' | 'down';
  duration: number;
  distance: { x: number; y: number; };
  delta: { x: number; y: number; };
  isFirst: boolean;
  isFinal: boolean;
}

export interface HoldArguments {
  evt: MouseEvent | TouchEvent;
  position: { top: number; left: number; };
  duration: number;
}
