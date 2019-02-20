export interface FlowRoute {
  outCoords: string;
  friction?: number;
  pressure?: number;
  deltaPressure?: number;
}

export interface Transitions {
  [inCoords: string]: FlowRoute[];
}

export interface CalculatedFlows {
  [inCoords: string]: number;  // pressure
}

export interface PersistentPart {
  type: string;
  x: number;
  y: number;
  rotate: number;
  liquidSource?: string;
  closed?: boolean;
  disabled?: boolean;
  flipped?: boolean;
}

export interface ComponentSettings {
  isSource: boolean;
  isBridge: boolean;
  cards: string[];
  transitions: (part: PersistentPart) => Transitions;
  size: (part: PersistentPart) => [number, number];
}

export interface FlowPart extends PersistentPart {
  transitions: Transitions;
  calculated?: CalculatedFlows;
  liquid?: string;
}

export interface ProcessViewConfig {
  parts: PersistentPart[];
}
