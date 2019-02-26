export interface FlowRoute {
  outCoords: string;
  friction?: number;
  pressure?: number;
  liquids?: string[];
}

export interface Transitions {
  [inCoords: string]: FlowRoute[];
}

export interface CalculatedFlows {
  [inCoords: string]: number;
}

export interface PersistentPart {
  type: string;
  x: number;
  y: number;
  rotate: number;
  flipped?: boolean;
  settings: Record<string, any>;
}

export interface ComponentSettings {
  cards: string[];
  transitions: (part: PersistentPart) => Transitions;
  size: (part: PersistentPart) => [number, number];
}

export interface FlowPart extends PersistentPart {
  transitions: Transitions;
  flows: CalculatedFlows;
  liquids: string[];
}

export interface ProcessViewConfig {
  parts: PersistentPart[];
}
