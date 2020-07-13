import { Layout } from 'plotly.js';

import { GraphAxis, GraphValueAxes, QueryParams } from '@/plugins/history/types';
import { Crud } from '@/store/features';

export type BlockInterfaceType =
  | 'ProcessValueInterface'
  | 'TempSensorInterface'
  | 'SetpointSensorPairInterface'
  | 'ActuatorAnalogInterface'
  | 'ActuatorDigitalInterface'
  | 'BalancerInterface'
  | 'MutexInterface'
  | 'OneWireDeviceInterface'
  | 'IoArrayInterface'
  | 'DS2408Interface'

export type SystemBlockType =
  | 'SysInfo'
  | 'Groups'
  | 'OneWireBus'
  | 'Ticks'
  | 'WiFiSettings'
  | 'TouchSettings'

export type UserBlockType =
  | 'ActuatorAnalogMock'
  | 'ActuatorLogic'
  | 'ActuatorOffset'
  | 'ActuatorPwm'
  | 'Balancer'
  | 'DeprecatedObject'
  | 'DigitalActuator'
  | 'DisplaySettings'
  | 'DS2408'
  | 'DS2413'
  | 'InactiveObject'
  | 'MockPins'
  | 'MotorValve'
  | 'Mutex'
  | 'Pid'
  | 'SetpointProfile'
  | 'SetpointSensorPair'
  | 'Spark2Pins'
  | 'Spark3Pins'
  | 'TempSensorMock'
  | 'TempSensorOneWire'

export type BlockType = SystemBlockType | UserBlockType;
export type BlockOrIntfType = BlockType | BlockInterfaceType;

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

export interface BlockFieldAddress extends BlockAddress {
  field: string | null;
  postfix: string | null;
}

export interface Block extends BlockAddress {
  serviceId: string;
  id: string;
  nid?: number;
  type: BlockType;
  groups: number[];
  data: any;
}

/**
 * The serialized format of Block
 */
export type DataBlock = Omit<Block, 'serviceId'>;

export interface BlockIds {
  id?: string;
  nid?: number;
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

export interface BlockField<T extends Block = Block> {
  key: string & keyof T['data'];
  title: string;
  component: string;
  componentProps?: any;
  generate: (serviceId: string | null) => any;
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
  generate: (serviceId: string | null) => T['data'];
  fields: BlockField<T>[];
  presets?: BlockDataPreset<T>[];
}
