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

export interface CompatibleBlocks {
  [key: string]: string[];
}

export interface SystemStatus {
  checkedAt: Date;
  available: boolean;
  connected: boolean;
  synchronized: boolean;
  error?: any;
}

export interface BlockLink {
  source: string;
  target: string;
  relation: string[];
}
