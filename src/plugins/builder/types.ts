import { MetricsConfig } from '@/plugins/history/types';
import { StoreObject } from 'brewblox-proto/ts';
import { Enum } from 'typescript-string-enums';

export const BuilderType = Enum(
  'BeerBottle',
  'BridgeTube',
  'BuilderLabel',
  'Carboy',
  'CheckValve',
  'Coil',
  'Condenser',
  'Conical',
  'CounterflowChiller',
  'CrossTube',
  'DipTube',
  'ElbowTube',
  'FilterBottom',
  'Fridge',
  'GraphDisplay',
  'GravityTube',
  'HeatingElement',
  'ImageDisplay',
  'ImmersionCoil',
  'Keg',
  'Kettle',
  'Lauterhexe',
  'LValve',
  'MetricsDisplay',
  'PidDisplay',
  'ProfileDisplay',
  'Pump',
  'PwmDisplay',
  'RimsTube',
  'SensorDisplay',
  'SessionLogDisplay',
  'SetpointDisplay',
  'SetpointDriverDisplay',
  'ShiftedSystemIO',
  'StraightInletTube',
  'StraightTube',
  'SystemIO',
  'TeeTube',
  'TiltDisplay',
  'UrlDisplay',
  'Valve',
  'WebframeDisplay',
  'WhirlpoolInlet',
);

export type BuilderType = Enum<typeof BuilderType>;

export interface FlowRoute {
  outCoords: string;
  friction?: number;
  pressure?: number;
  liquids?: string[];
  internal?: boolean;
  sink?: boolean;
  source?: boolean;
}

export interface PartTransitions {
  [inCoords: string]: FlowRoute[];
}

export interface LiquidFlow {
  [liquid: string]: number;
}

export interface PartFlows {
  [inCoords: string]: LiquidFlow;
}

export interface PathFriction {
  friction: number;
  pressureDiff: number;
}

export interface BuilderPart {
  id: string;
  type: BuilderType;
  x: number;
  y: number;
  width: number;
  height: number;
  rotate: number;
  settings: Mapped<any>;
  flipped?: boolean;
  metrics?: MetricsConfig;
}

export interface BuilderBlueprint {
  type: BuilderType;
  title: string;
  component: string;
  defaultSize: AreaSize;
  transitions: (part: BuilderPart) => Maybe<PartTransitions>;
}

export interface BuilderLayout extends StoreObject {
  id: string;
  title: string;
  width: number;
  height: number;
  parts: BuilderPart[];
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
