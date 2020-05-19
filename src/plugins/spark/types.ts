import { Layout } from 'plotly.js';

import { Link, Unit } from '@/helpers/units';
import { StoreObject } from '@/plugins/database';
import { GraphAxis, GraphValueAxes, QueryParams } from '@/plugins/history/types';
import { Crud, WidgetFeature } from '@/store/features';
import { Service } from '@/store/services';

export interface BlockField<DataT = any> {
  key: string & keyof DataT;
  title: string;
  component: string;
  componentProps?: any;
  generate: () => any;
  pretty?: (val: any) => string;
  readonly?: boolean;
  graphed?: boolean;
  graphAxis?: GraphAxis;
  graphName?: string;
}

export interface BlockDataPreset<DataT = any> {
  name: string;
  generate: () => Partial<DataT>;
}

export interface StoredDataPreset<DataT = any> extends StoreObject {
  type: string;
  name: string;
  data: Partial<DataT>;
}

export interface BlockSpec<DataT = any> {
  id: string;
  systemObject?: boolean;
  generate: () => DataT;
  fields: BlockField<DataT>[];
  presets?: BlockDataPreset<DataT>[];
}

export type PageMode = 'Relations' | 'List';

export interface SparkConfig {
  groupNames: string[];
  expandedBlocks: { [id: string]: boolean };
  sorting: string;
  pageMode: PageMode;
}

export type SparkService = Service<SparkConfig>;

/**
 * There are two approaches to having a serializable reference to a block:
 * Link, and BlockAddress
 *
 * Link is used inside block data, and serializes to `"key<type>": "id"`.
 * Service ID is not stored.
 *
 * BlockAddress includes service ID, and is intended for wider use
 * where service ID is not obvious, or where all services are equally valid.
 *
 * No special serialization rules exist: it is saved as a common JSON object.
 */
export interface BlockAddress {
  serviceId: string | null;
  id: string | null;
  type: string | null;
}

export interface DataBlock {
  id: string;
  nid?: number;
  type: string;
  groups: number[];
  data: any;
}

export interface Block extends DataBlock, BlockAddress {
  serviceId: string;
  id: string;
  type: string;
}

export interface BlockConfig {
  serviceId: string;
  blockId: string;
  queryParams?: QueryParams;
  graphAxes?: GraphValueAxes;
  graphLayout?: Partial<Layout>;
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

export type UserUnitKey = 'Temp';

export type UserUnits = Record<UserUnitKey, string>;

/**
 * As sent/pushed by the devcon-spark service
 */
export interface ApiSparkStatus {
  autoconnecting: boolean;
  connect: boolean;
  handshake: boolean;
  synchronize: boolean;
  compatible: boolean;
  latest: boolean;
  valid: boolean;
  info: string[];
  address: string | null;
  connection: 'simulation' | 'usb' | 'wifi' | null;
}

export interface SparkStatus extends ApiSparkStatus {
  serviceId: string;
  available: boolean;
}

export interface SparkStoreEntry {
  keys: [string, number];
  data: any;
}

export interface SparkExported {
  blocks: DataBlock[];
  store: SparkStoreEntry[];
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


export interface DisplayOpts {
  color: string;
  name: string;
  pos?: number;
  unique: boolean;
  showNotify: boolean;
  showDialog: boolean;
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

export type DigitalConstraintKey =
  'mutexed'
  | 'minOff'
  | 'minOn'
  | 'delayedOff'
  | 'delayedOn';

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

export interface DelayedOnConstraint {
  remaining: Unit;
  delayedOn: Unit;
}

export interface DelayedOffConstraint {
  remaining: Unit;
  delayedOff: Unit;
}

export type DigitalConstraint =
  MutexedConstraint
  | MinOnConstraint
  | MinOffConstraint
  | DelayedOnConstraint
  | DelayedOffConstraint;

export interface AnalogConstraintsObj {
  constraints: AnalogConstraint[];
}

export interface DigitalConstraintsObj {
  constraints: DigitalConstraint[];
}

export interface AnyConstraintsObj {
  constraints: (AnalogConstraint | DigitalConstraint)[];
}
