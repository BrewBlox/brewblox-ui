import isArray from 'lodash/isArray';
import { Enum } from 'typescript-string-enums';

import {
  Block,
  BlockIntfType,
  BlockType,
  SparkPatchEvent,
  SparkStateEvent,
  SparkUpdateEvent,
  SystemBlockType,
} from '@/shared-types';
import { featureStore } from '@/store/features';
import { isLink } from '@/utils/bloxfield';

import { compatibleTypes } from '../const';
import { sparkStore } from '../store';
import { BlockAddress, ComparedBlockType } from '../types';
import { getDisplaySettingsBlock } from './system';


export function isCompatible(type: Maybe<string>, intf: ComparedBlockType): boolean {
  if (!intf) { return true; }
  if (!type) { return false; }
  if (type === intf) { return true; }
  if (isArray(intf)) { return intf.some(i => isCompatible(type, i)); }
  return Boolean(compatibleTypes[intf]?.includes(type));
}

export function ifCompatible<T extends Block>(block: Maybe<Block>, intf: ComparedBlockType): T | null {
  return block && isCompatible(block.type, intf)
    ? block as T
    : null;
}

export function isSystemBlockType(type: Maybe<string>): boolean {
  return Enum.isType(SystemBlockType, type);
}

export function isBlockDisplayReady(addr: BlockAddress): boolean {
  return isCompatible(addr?.type, [
    BlockIntfType.TempSensorInterface,
    BlockIntfType.SetpointSensorPairInterface,
    BlockIntfType.ActuatorAnalogInterface,
    BlockType.Pid,
  ]);
}

export function isBlockDisplayed(addr: BlockAddress): boolean {
  return addr.id !== null
    && !!getDisplaySettingsBlock(addr.serviceId)?.data.widgets
      .find(w => Object.values(w).find(v => isLink(v) && v.id === addr.id));
}

export function isBlockVolatile(block: Block | null): boolean {
  return block?.meta?.volatile === true;
}

export function isBlockRemovable(block: Block | null): boolean {
  return block !== null
    && !isBlockVolatile(block)
    && featureStore.widgetRemoveActions(block.type).length > 0;
}

export const isBlockDriven = (block: Block | null): boolean =>
  Boolean(
    block
    && sparkStore
      .moduleById(block.serviceId)
      ?.drivenChains
      .some((chain: string[]) => chain[0] === block.id));

export const isSparkState = (data: unknown): data is SparkStateEvent =>
  (data as SparkStateEvent).type === 'Spark.state';

export const isSparkPatch = (data: unknown): data is SparkPatchEvent =>
  (data as SparkPatchEvent).type === 'Spark.patch';

export const isSparkUpdate = (data: unknown): data is SparkUpdateEvent =>
  (data as SparkUpdateEvent).type === 'Spark.update';
