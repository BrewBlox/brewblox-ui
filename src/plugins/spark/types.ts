import { DashboardItem } from '@/store/dashboards';
import { Feature } from '@/store/features';
import { Service } from '@/store/services';

export interface ChangeField {
  key: string;
  title: string;
  component: string;
  componentProps?: any;
  generate: () => any;
}

export type BlockDataGenerator = () => Record<string, any>;

export interface BlockDataPreset {
  name: string;
  generate: BlockDataGenerator;
}

export interface BlockSpec {
  id: string;
  systemObject?: boolean;
  generate: BlockDataGenerator;
  presets: BlockDataPreset[];
  changes: ChangeField[];
}

export interface SparkFeature {
  feature: Feature;
  block?: BlockSpec;
}

export interface SparkConfig {
  groupNames: string[];
  expandedBlocks: { [id: string]: boolean };
  sorting: string;
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
}

export interface DashboardBlock extends DashboardItem {
  config: BlockConfig;
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

export interface BlockLink {
  source: string;
  target: string;
  relation: string[];
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
