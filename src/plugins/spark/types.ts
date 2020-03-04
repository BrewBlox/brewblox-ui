import { Link, Unit } from '@/helpers/units';
import { StoreObject } from '@/plugins/database';
import { GraphValueAxes, QueryParams } from '@/plugins/history/types';
import { Crud, WidgetFeature } from '@/store/features';
import { Service } from '@/store/services';

export interface ChangeField {
  key: string;
  title: string;
  component: string;
  componentProps?: any;
  generate: () => any;
  pretty?: (val: any) => string;
}

export interface BlockDataPreset<DataT = any> {
  name: string;
  generate: () => Partial<DataT>;
}

export interface StoredDataPreset extends StoreObject {
  id: string;
  type: string;
  name: string;
  data: Mapped<any>;
}

export interface BlockSpec<DataT = any> {
  id: string;
  systemObject?: boolean;
  generate: () => DataT;
  presets: BlockDataPreset<DataT>[];
  changes: ChangeField[];
  graphTargets?: Mapped<string>;
}

export type PageMode = 'Relations' | 'List';

export interface SparkConfig {
  groupNames: string[];
  expandedBlocks: { [id: string]: boolean };
  sorting: string;
  pageMode: PageMode;
}

export type SparkService = Service<SparkConfig>;

export interface DataBlock {
  id: string;
  nid?: number;
  type: string;
  groups: number[];
  data: any;
}

export interface Block extends DataBlock {
  serviceId: string;
}

export interface BlockConfig {
  serviceId: string;
  blockId: string;
  queryParams?: QueryParams;
  graphAxes?: GraphValueAxes;
}

export interface BlockCrud<BlockT extends Block = Block> extends Crud<BlockConfig> {
  block: BlockT;
  isStoreBlock: boolean;
  saveBlock: (block: BlockT) => unknown | Promise<unknown>;
}

export interface SparkFeature {
  feature: WidgetFeature<BlockConfig>;
  block?: BlockSpec;
}

export interface UserUnits {
  [key: string]: string;
}

export interface UnitAlternatives {
  [key: string]: string[];
}

export interface CompatibleTypes {
  [key: string]: string[];
}

/**
 * As sent/pushed by the devcon-spark service
 */
export interface ApiSparkStatus {
  connect: boolean;
  handshake: boolean;
  synchronize: boolean;
  compatible: boolean;
  latest: boolean;
  valid: boolean;
  info: string[];
}

export interface SparkStatus extends ApiSparkStatus {
  serviceId: string;
  available: boolean;
}

export interface RelationEdge {
  source: string;
  target: string;
  relation: string[];
}

export interface RelationNode {
  id: string;
  type: string;
}

export interface Limiters {
  [blockId: string]: string[];
}

export enum ChannelConfig {
  Unused = 0,
  ActiveLow = 1,
  ActiveHigh = 2,
  Input = 10,
  Unknown = 255,
}

export enum DigitalState {
  Inactive = 0,
  Active = 1,
  Unknown = 2,
}

export interface IoChannel {
  config: ChannelConfig;
  state: DigitalState;
}

export interface IoPin {
  [key: string]: IoChannel;
}


export interface DisplaySlot {
  pos: number;
  color: string;
  name: string;

  // Value will be one of these
  tempSensor?: Link;
  setpointSensorPair?: Link;
  actuatorAnalog?: Link;
  pid?: Link;
}

export type AnalogConstraintKey = 'min' | 'max' | 'balanced';

export interface MinConstraint {
  limiting: boolean;
  min: number;
}

export interface MaxConstraint {
  limiting: boolean;
  max: number;
}

export interface BalancedConstraint {
  limiting: boolean;
  balanced: {
    balancerId: Link;
    granted: number;
    id: number;
  };
}

export type AnalogConstraint =
  MinConstraint
  | MaxConstraint
  | BalancedConstraint;

export interface AnalogConstraintsObj {
  constraints: AnalogConstraint[];
}

export type DigitalConstraintKey = 'minOff' | 'minOn' | 'mutexed';

export interface MinOnConstraint {
  remaining: Unit;
  minOn: Unit;
}

export interface MinOffConstraint {
  remaining: Unit;
  minOff: Unit;
}

export interface MutexedConstraint {
  remaining: Unit;
  mutexed: {
    mutexId: Link;
    extraHoldTime: Unit;
    hasCustomHoldTime: boolean;
    hasLock: boolean;
  };
}

export type DigitalConstraint =
  MinOnConstraint
  | MinOffConstraint
  | MutexedConstraint;

export interface DigitalConstraintsObj {
  constraints: DigitalConstraint[];
}
