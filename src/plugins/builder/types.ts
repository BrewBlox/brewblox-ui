import { MetricsConfig } from '@/plugins/history/types';
import { StoreObject } from 'brewblox-proto/ts';

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
  metrics?: MetricsConfig;
}

export interface StatePart extends PersistentPart {
  transitions: Transitions;
  size: [number, number];
}

export interface FlowPart extends StatePart {
  flows: CalculatedFlows;
}

export interface PartSettingsCard {
  component: string;
  props: Mapped<any>;
}

export interface BuilderBlueprint {
  type: string;
  title: string;
  component?: string; // defaults to `${type}PartComponent`
  cards: PartSettingsCard[];
  transitions: (part: PersistentPart) => Transitions;
  size: (part: PersistentPart) => [number, number];
}

export interface BuilderLayout extends StoreObject {
  id: string;
  title: string;
  width: number;
  height: number;
  parts: PersistentPart[];
  parentFolder?: string | null;
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

export type BuilderToolName =
  | 'pan'
  | 'select'
  | 'gridresize'
  | 'add'
  | 'move'
  | 'copy'
  | 'rotate'
  | 'flip'
  | 'edit'
  | 'interact'
  | 'delete'
  | 'undo'
  | 'redo';

export interface BuilderTool {
  value: BuilderToolName;
  label: string;
  icon: string;
  shortcut: string;
  cursor: string;
}
