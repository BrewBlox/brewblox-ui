import { Coordinates } from '@/helpers/coordinates';

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

export interface StatePart extends PersistentPart {
  state: Record<string, any>;
}

export interface FlowPart extends StatePart {
  transitions: Transitions;
  flows: CalculatedFlows;
}

export interface PartUpdater {
  updatePart: (part: PersistentPart) => void;
  updatePartState: (part: StatePart) => void;
}

export interface ComponentSettings {
  cards: string[];
  transitions: (part: StatePart) => Transitions;
  size: (part: PersistentPart) => [number, number];
  blockedCoordinates: (part: PersistentPart) => Coordinates[];
  interactHandler?: (part: StatePart, updater: PartUpdater) => void;
}

export interface ProcessViewConfig {
  currentToolId?: string;
  parts: PersistentPart[];
}

interface Rect {
  x: number;
  y: number;
  left: number;
  right: number;
  top: number;
  bottom: number;
}

type ClickEvent = MouseEvent | TouchEvent;
