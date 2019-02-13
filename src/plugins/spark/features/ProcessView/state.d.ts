import { VueConstructor } from 'vue';

export type Coordinate = string;

export interface Flow {
  outCoords: string;
  friction?: number;
  pressure?: number;
  deltaPressure?: number;
}

export interface AngledFlows {
  [inCoords: string]: Flow[];
}

export interface FlowPressure {
  [inCoords: string]: number;  // pressure
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
