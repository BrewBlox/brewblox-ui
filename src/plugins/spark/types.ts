import { PersistentWidget } from '@/store/dashboards';
import { Crud, Feature } from '@/store/features';
import { GraphValueAxes, QueryParams } from '@/store/history';
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

export type DashboardBlock = PersistentWidget<BlockConfig>;

export interface BlockCrud extends Crud<BlockConfig> {
  block: Block;
  isStoreBlock: boolean;
  saveBlock: (block: Block) => unknown | Promise<unknown>;
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
