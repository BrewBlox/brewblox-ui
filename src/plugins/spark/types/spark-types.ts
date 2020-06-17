import { StoreObject } from '@/plugins/database';
import { WidgetFeature } from '@/store/features';
import { Service } from '@/store/services';

import { BlockConfig, BlockSpec, DataBlock } from './block-types';


export interface StoredDataPreset<DataT = any> extends StoreObject {
  type: string;
  name: string;
  data: Partial<DataT>;
}

export type PageMode = 'Relations' | 'List';

export interface SparkSessionConfig {
  expandedBlocks: { [id: string]: boolean };
  sorting: string;
  pageMode: PageMode;
}

export type SparkService = Service<{}>;

export interface SparkFeature {
  feature: WidgetFeature<BlockConfig>;
  block?: BlockSpec;
}

export type UserUnitKey = 'Temp';

export interface UserUnits {
  Temp: 'degC' | 'degF';
}

/**
 * As sent/pushed by the devcon-spark service
 */
export interface ApiSparkStatus {
  type: 'Spark';
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
