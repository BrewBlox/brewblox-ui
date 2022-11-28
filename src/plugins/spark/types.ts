import {
  GraphAxis,
  GraphValueAxes,
  QueryParams,
} from '@/plugins/history/types';
import { WidgetFeature } from '@/store/features';
import { Service } from '@/store/services';
import { Widget } from '@/store/widgets';
import {
  AnyConstraintKey,
  Block,
  BlockOrIntfType,
  DateString,
  Quantity,
  SparkDeviceDescription,
  SparkFirmwareDescription,
  StoreObject,
} from 'brewblox-proto/ts';
import { Layout } from 'plotly.js';

export type ComparedBlockType = BlockOrIntfType | BlockOrIntfType[] | null;

export type PageMode = 'Relations' | 'List';

export type BlockStatus = 'Active' | 'Inactive' | 'Disabled' | 'Invalid';

export interface SparkSessionConfig {
  pageMode: PageMode;
  sorting: string;
  expanded: string[];
}

export type SparkService = Service<Record<string, never>>;

export interface SparkFeature {
  feature: WidgetFeature<BlockConfig>;
  block?: BlockSpec;
}

export interface SparkStoreEntry {
  keys: [string, number];
  data: any;
}

export interface SparkExported {
  blocks: Block[];
  store: SparkStoreEntry[];
  timestamp?: DateString;
  firmware?: SparkFirmwareDescription;
  device?: SparkDeviceDescription;
}

export interface BlockLimitation {
  target: string;
  constraint: AnyConstraintKey;
  remaining: Quantity | null;
}

export interface BlockRelationNode {
  id: string;
  type: string;
  status?: BlockStatus;
  name?: string; // overrides `id` for rendering
  title?: string; // overrides `type` for rendering
}

export interface BlockDataSnippet<T extends Block = Block> extends StoreObject {
  name: string;
  type: T['type'];
  data: Partial<T['data']>;
}

export interface ProfileValues {
  prev: Quantity;
  current: Quantity;
  next: Quantity;
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
  volatile?: true;
  queryParams?: QueryParams;
  graphAxes?: GraphValueAxes;
  graphLayout?: Partial<Layout>;
}

export type BlockWidget = Widget<BlockConfig>;

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

export interface BlockFieldSpec<T extends Block = Block> {
  type: T['type'];
  key: string & keyof T['data'];
  title: string;
  component: string;
  componentProps?: AnyDict;
  generate: () => any;
  valueHint?: string;
  pretty?: (val: any) => string;
  readonly?: boolean;
  graphed?: boolean;
  graphAxis?: GraphAxis;
  graphName?: string;
}

export interface BlockSpec<T extends Block = Block> {
  type: T['type'];
  generate: () => T['data'];
  analyze: (block: T) => BlockStatus;
}
