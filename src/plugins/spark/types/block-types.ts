import { Layout } from 'plotly.js';

import { GraphAxis, GraphValueAxes, QueryParams } from '@/plugins/history/types';
import { Crud } from '@/store/features';

import type { ActuatorAnalogMockBlock } from '../features/ActuatorAnalogMock/types';
import type { ActuatorLogicBlock } from '../features/ActuatorLogic/types';
import type { ActuatorOffsetBlock } from '../features/ActuatorOffset/types';
import type { ActuatorPwmBlock } from '../features/ActuatorPwm/types';
import type { BalancerBlock } from '../features/Balancer/types';
import type { DeprecatedObjectBlock } from '../features/DeprecatedObject/types';
import type { DigitalActuatorBlock } from '../features/DigitalActuator/types';
import type { DisplaySettingsBlock } from '../features/DisplaySettings/types';
import type { DS2408Block } from '../features/DS2408/types';
import type { DS2413Block } from '../features/DS2413/types';
import type { InactiveObjectBlock } from '../features/InactiveObject/types';
import type { MockPinsBlock } from '../features/MockPins/types';
import type { MotorValveBlock } from '../features/MotorValve/types';
import type { MutexBlock } from '../features/Mutex/types';
import type { PidBlock } from '../features/Pid/types';
import type { SetpointProfileBlock } from '../features/SetpointProfile/types';
import type { SetpointSensorPairBlock } from '../features/SetpointSensorPair/types';
import type { Spark2PinsBlock } from '../features/Spark2Pins/types';
import type { Spark3PinsBlock } from '../features/Spark3Pins/types';
import type { TempSensorMockBlock } from '../features/TempSensorMock/types';
import type { TempSensorOneWireBlock } from '../features/TempSensorOneWire/types';

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
  data: any & {};
}

export interface BlockBase extends DataBlock, BlockAddress {
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

export interface OneWireBusBlock extends BlockBase {
  type: 'OneWireBus';
  data: {
    command: {
      opcode: number;
      data: number;
    };
    address: string[];
  };
}

export interface GroupsBlock extends BlockBase {
  type: 'Groups';
  data: {
    active: number[];
  };
}

export interface SysInfoBlock extends BlockBase {
  type: 'SysInfo';
  data: {
    deviceId: string;
    platform: number;
    hardware: number;
    voltage5: number;
    voltage12: number;
    version: string;
    releaseDate: string;
    protocolVersion: string;
    protocolDate: string;
  };
}

export interface TicksBlock extends BlockBase {
  type: 'Ticks';
  data: {
    millisSinceBoot: number;
    secondsSinceEpoch: number;
  };
}

export interface WiFiSettingsBlock extends BlockBase {
  type: 'WifiSettings';
  data: {
    ssid: string;
    password: string;
    security: number;
    cipher: number;
    signal: number;
    ip: string;
  };
}

export interface TouchSettingsBlock extends BlockBase {
  type: 'TouchSettings';
  data: {
    calibrated: number;
    xOffset: number;
    yOffset: number;
    xBitsPerPixelX16: number;
    yBitsPerPixelX16: number;
  };
}

export type BlockInterfaceType =
  'ProcessValueInterface'
  | 'TempSensorInterface'
  | 'SetpointSensorPairInterface'
  | 'ActuatorAnalogInterface'
  | 'ActuatorDigitalInterface'
  | 'BalancerInterface'
  | 'MutexInterface'
  | 'OneWireDeviceInterface'
  | 'IoArrayInterface'
  | 'DS2408Interface'
  ;

export type SystemBlockType =
  SysInfoBlock['type']
  | GroupsBlock['type']
  | OneWireBusBlock['type']
  | TicksBlock['type']
  | WiFiSettingsBlock['type']
  | TouchSettingsBlock['type']
  ;

export type UserBlockType =
  | ActuatorAnalogMockBlock['type']
  | ActuatorLogicBlock['type']
  | ActuatorOffsetBlock['type']
  | ActuatorPwmBlock['type']
  | BalancerBlock['type']
  | DeprecatedObjectBlock['type']
  | DigitalActuatorBlock['type']
  | DisplaySettingsBlock['type']
  | DS2408Block['type']
  | DS2413Block['type']
  | InactiveObjectBlock['type']
  | MockPinsBlock['type']
  | MotorValveBlock['type']
  | MutexBlock['type']
  | PidBlock['type']
  | SetpointProfileBlock['type']
  | SetpointSensorPairBlock['type']
  | Spark2PinsBlock['type']
  | Spark3PinsBlock['type']
  | TempSensorMockBlock['type']
  | TempSensorOneWireBlock['type']
  ;

export type BlockType = SystemBlockType | UserBlockType;
export type BlockOrIntfType = BlockType | BlockInterfaceType;

export interface Block extends BlockBase {
  type: BlockType;
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
  generate: () => any;
  pretty?: (val: any) => string;
  readonly?: boolean;
  graphed?: boolean;
  graphAxis?: GraphAxis;
  graphName?: string;
}

export interface BlockSpec<T extends Block = Block> {
  id: T['type'];
  systemObject?: boolean;
  generate: () => T['data'];
  fields: BlockField<T>[];
  presets?: BlockDataPreset<T>[];
}
