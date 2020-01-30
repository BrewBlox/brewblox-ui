import { StoreObject } from '@/plugins/database';
import { Widget } from '@/store/dashboards';

export interface FlowRoute {
  outCoords: string;
  friction?: number;
  pressure?: number;
  liquids?: string[];
  internal?: boolean;
  sink?: boolean;
  source?: boolean;
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

export interface PathFriction {
  friction: number;
  pressureDiff: number;
}

export interface PersistentPart {
  id: string;
  type: string;
  x: number;
  y: number;
  rotate: number;
  flipped?: boolean;
  settings: Mapped<any>;
}

export interface StatePart extends PersistentPart {
  transitions: Transitions;
  size: [number, number];
}

export interface FlowPart extends StatePart {
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
  props?: Mapped<any>;
}

export interface PartSpec {
  id: string;
  title: string;
  component?: string; // ID is used by default
  cards: CardSpec[];
  transitions: (part: PersistentPart) => Transitions;
  size: (part: PersistentPart) => [number, number];
  interactHandler?: (part: PersistentPart, updater: PartUpdater) => void;
}

export interface BuilderLayout extends StoreObject {
  id: string;
  title: string;
  width: number;
  height: number;
  parts: PersistentPart[];
}

export interface BuilderConfig {
  currentLayoutId: string | null;
  layoutIds: string[];
}

export interface BuilderItem extends Widget {
  config: BuilderConfig;
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
