import { StoreObject } from '@/plugins/database';
import { Link } from '@/plugins/spark/units';
import { WidgetFeature } from '@/store/features';
import { Service } from '@/store/services';

import { BlockConfig, BlockSpec, DataBlock } from './block-types';


export interface StoredDataPreset<DataT = any> extends StoreObject {
  type: string;
  name: string;
  data: Partial<DataT>;
}

export type PageMode = 'Relations' | 'List';

export interface SparkConfig {
  groupNames: string[];
  expandedBlocks: { [id: string]: boolean };
  sorting: string;
  pageMode: PageMode;
}

export type SparkService = Service<SparkConfig>;


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
