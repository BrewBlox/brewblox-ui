export interface FlowRoute {
  outCoords: string;
  friction?: number;
  pressure?: number;
  liquids?: string[];
}

export interface Transitions {
  [inCoords: string]: FlowRoute[];
}

export interface LiquidFlow {
  [liquid: string]: number;
}

export interface CalculatedFlows {
  [inCoords: string]: LiquidFlow;
}

export interface PersistentPart {
  id: string;
  type: string;
  x: number;
  y: number;
  rotate: number;
  flipped?: boolean;
  settings: Record<string, any>;
}

export interface FlowPart extends PersistentPart {
  transitions: Transitions;
  flows: CalculatedFlows;
}

export interface PartUpdater {
  updatePart: (part: PersistentPart) => void;
}

export interface LinkedBlock {
  serviceId: string | null;
  blockId: string | null;
}

export interface CardSpec {
  component: string;
  props?: Record<string, any>;
}

export interface ComponentSpec {
  cards: CardSpec[];
  transitions: (part: PersistentPart) => Transitions;
  size: (part: PersistentPart) => [number, number];
  interactHandler?: (part: PersistentPart, updater: PartUpdater) => void;
}

export interface BuilderLayout {
  id: string;
  title: string;
  width: number;
  height: number;
  parts: PersistentPart[];
  _rev?: string;
}

export interface BuilderConfig {
  currentToolId?: string;
  currentLayoutId: string | null;
  layoutIds: string[];
}

export interface Rect {
  x: number;
  y: number;
  left: number;
  right: number;
  top: number;
  bottom: number;
}

export type ClickEvent = MouseEvent | TouchEvent;
