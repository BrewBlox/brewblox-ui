import { Link, Unit } from '@/helpers/units';
import { GraphValueAxes, QueryParams } from '@/plugins/history/types';
import { Widget } from '@/store/dashboards';
import { Crud, Feature } from '@/store/features';
import { Service } from '@/store/services';

export interface ChangeField {
  key: string;
  title: string;
  component: string;
  componentProps?: any;
  generate: () => any;
  pretty?: (val: any) => string;
}

export type BlockDataGenerator = () => Mapped<any>;

export interface BlockDataPreset {
  name: string;
  generate: BlockDataGenerator;
}

export interface StoredDataPreset {
  id: string;
  type: string;
  name: string;
  data: Mapped<any>;
  _rev?: string;
}

export interface BlockSpec {
  id: string;
  systemObject?: boolean;
  generate: BlockDataGenerator;
  presets: BlockDataPreset[];
  changes: ChangeField[];
  graphTargets?: Mapped<string>;
}

export interface SparkFeature {
  feature: Feature;
  block?: BlockSpec;
}

export type PageMode = 'Relations' | 'List';

export interface SparkConfig {
  groupNames: string[];
  expandedBlocks: { [id: string]: boolean };
  sorting: string;
  pageMode: PageMode;
}

export interface Spark extends Service {
  config: SparkConfig;
}

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

export type DashboardBlock = Widget<BlockConfig>;

export interface BlockCrud<BlockT extends Block = Block> extends Crud<BlockConfig> {
  block: BlockT;
  isStoreBlock: boolean;
  saveBlock: (block: BlockT) => unknown | Promise<unknown>;
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

export interface SystemStatus {
  checkedAt: Date;
  available: boolean;
  connect: boolean;
  handshake: boolean;
  synchronize: boolean;
  compatible: boolean;
  latest: boolean;
  valid: boolean;
  info: string[];
  error?: any;
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

export interface AnalogConstraint {
  limiting: boolean;
  min?: number;
  max?: number;
  balanced?: {
    balancerId: Link;
    granted: number;
    id: number;
  };
}

export interface DigitalConstraint {
  limiting: boolean;
  minOn?: Unit;
  minOff?: Unit;
  mutex?: Link; // Mutex
}

export interface ConstraintsObj {
  constraints: AnalogConstraint[] | DigitalConstraint[];
}
