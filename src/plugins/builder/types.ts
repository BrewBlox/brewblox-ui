import { StoreObject } from '@/shared-types';

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
  canInteract: boolean;
}

export interface FlowPart extends StatePart {
  flows: CalculatedFlows;
}

export interface PartApi {
  savePart: (part: PersistentPart) => unknown;
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
  interactHandler?: (part: PersistentPart, api: PartApi) => void;
}

export interface BuilderLayout extends StoreObject {
  id: string;
  title: string;
  width: number;
  height: number;
  order?: number;
  listed?: boolean;
  parts: PersistentPart[];
}

export interface BuilderConfig {
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

export type BuilderModeName =
  | 'select'
  | 'pan'
  | 'interact'
  | 'gridsize'

export type BuilderToolName =
  | 'add'
  | 'move'
  | 'copy'
  | 'rotate'
  | 'flip'
  | 'edit'
  | 'interact'
  | 'delete'
  | 'undo'
  | 'redo'

export interface BuilderMode {
  value: BuilderModeName;
  label: string;
  icon: string;
  partClass: (part: FlowPart) => string;
  gridCursor: string;
  showHover: boolean;
}

export interface BuilderTool {
  value: BuilderToolName;
  label: string;
  icon: string;
  shortcut: string;
}
