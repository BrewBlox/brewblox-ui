export * from '@/shared-types/spark-block-enums';
export * from '@/shared-types/spark-block-types';
export * from '@/shared-types/spark-service-types';

import { Layout } from 'plotly.js';

import { GraphAxis, GraphValueAxes, QueryParams } from '@/plugins/history/types';
import { Block, BlockOrIntfType, StoreObject } from '@/shared-types';
import { Crud, WidgetFeature } from '@/store/features';
import { Service } from '@/store/services';

export type PageMode =
  | 'Relations'
  | 'List'

export interface SparkSessionConfig {
  expandedBlocks: { [id: string]: boolean };
  sorting: string;
  pageMode: PageMode;
}

export type SparkService = Service<Record<string, never>>;

export interface SparkFeature {
  feature: WidgetFeature<BlockConfig>;
  block?: BlockSpec;
}

export interface SparkStatus {
  serviceId: string;
  isServiceReachable: boolean;

  deviceAddress: string | null;
  connectionKind: 'simulation' | 'usb' | 'wifi' | null;

  isCompatibleFirmware?: boolean;
  isLatestFirmware?: boolean;
  isValidDeviceId?: boolean;

  isAutoconnecting?: boolean;
  isConnected?: boolean;
  isAcknowledged?: boolean;
  isSynchronized?: boolean;
  isUpdating?: boolean;
}

export interface SparkStoreEntry {
  keys: [string, number];
  data: any;
}

export interface SparkExported {
  blocks: Block[];
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

export interface StoredDataPreset<DataT = any> extends StoreObject {
  type: string;
  name: string;
  data: Partial<DataT>;
}

export interface ChannelMapping {
  id: string;
  nid: number;
  name: string;
}

export interface DisplayOpts {
  color: string;
  name: string;
  pos?: number;
  unique: boolean;
  showNotify: boolean;
  showDialog: boolean;
}

export interface BlockConfig {
  serviceId: string;
  blockId: string;
  queryParams?: QueryParams;
  graphAxes?: GraphValueAxes;
  graphLayout?: Partial<Layout>;
}

export interface BlockCrud<BlockT extends Block = Block>
  extends Crud<BlockConfig> {
  block: BlockT;
  isStoreBlock: boolean;
  saveBlock: (block: BlockT) => unknown | Promise<unknown>;
}

export interface BlockDataPreset<T extends Block = Block> {
  name: string;
  generate: () => Partial<T['data']>;
}

export interface BlockIds {
  id?: string;
  nid?: number;
}

/**
 * There are two approaches to having a serializable reference to a block:
 * Link, and BlockAddress
 *
 * Link is used inside block data, and does not include service ID in its serialized form.
 *
 * BlockAddress includes service ID, and is intended for wider use
 * where service ID is not obvious, or where all services are equally valid.
 *
 * No special serialization rules exist: it is saved as a common JSON object.
 *
 * Block conforms to BlockAddress. This allows passing a Block as a BlockAddress arg.
 */
export interface BlockAddress {
  serviceId: string | null;
  id: string | null;
  type: BlockOrIntfType | null;
}

export interface BlockFieldAddress extends BlockAddress {
  field: string | null;
}

export interface BlockField<T extends Block = Block> {
  key: string & keyof T['data'];
  title: string;
  component: string;
  componentProps?: any;
  generate: () => any;
  valueHint?: string;
  pretty?: (val: any) => string;
  readonly?: boolean;
  graphed?: boolean;
  graphAxis?: GraphAxis;
  graphName?: string;
}

export interface BlockSpec<T extends Block = Block> {
  id: T['type'];
  systemObject?: boolean;
  discovered?: boolean;
  generate: () => T['data'];
  fields: BlockField<T>[];
  presets?: BlockDataPreset<T>[];
}

export type ComparedBlockType = BlockOrIntfType | BlockOrIntfType[] | null;
