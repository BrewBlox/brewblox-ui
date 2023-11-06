import { BlockAddress, ComparedBlockType } from '../types';
import { useFeatureStore } from '@/store/features';
import { isLink } from '@/utils/identity';
import {
  Block,
  BlockClaim,
  BlockIntfType,
  BlockType,
  COMPATIBLE_TYPES,
  DisplaySettingsBlock,
  SparkPatchEvent,
  SparkStateEvent,
  SparkUpdateEvent,
  SystemBlockType,
} from 'brewblox-proto/ts';
import isArray from 'lodash/isArray';
import isString from 'lodash/isString';
import { Enum } from 'typescript-string-enums';

export function isCompatible(
  type: Maybe<string>,
  intf: ComparedBlockType,
): boolean {
  if (!intf) {
    return true;
  }
  if (!type) {
    return false;
  }
  if (type === intf) {
    return true;
  }
  if (isArray(intf)) {
    return intf.some((i) => isCompatible(type, i));
  }
  if (isString(intf)) {
    return Boolean(COMPATIBLE_TYPES[intf]?.includes(type));
  }
  return false;
}

export function isBlockCompatible<T extends Block>(
  block: Maybe<Block>,
  intf: ComparedBlockType,
): block is T {
  if (block == null) {
    return false;
  }
  return isCompatible(block.type, intf);
}

export function ifCompatible<T extends Block>(
  block: Maybe<Block>,
  intf: ComparedBlockType,
): T | null {
  return block && isCompatible(block.type, intf) ? (block as T) : null;
}

export function isSystemBlockType(
  type: Maybe<string>,
): type is SystemBlockType {
  return Enum.isType(SystemBlockType, type);
}

export function isDiscoveredBlockType(type: Maybe<string>): type is BlockType {
  return isCompatible(type, [
    BlockIntfType.OneWireBusInterface,
    BlockIntfType.OneWireDeviceInterface,
  ]);
}

export function isBlockDisplayReady(addr: BlockAddress): boolean {
  return isCompatible(addr?.type, [
    BlockIntfType.TempSensorInterface,
    BlockIntfType.SetpointSensorPairInterface,
    BlockIntfType.ActuatorAnalogInterface,
    BlockType.Pid,
  ]);
}

export function isBlockRemovable(block: Maybe<Block>): boolean {
  return (
    block != null &&
    useFeatureStore().widgetRemoveActions(block.type).length > 0
  );
}

export function isBlockDisplayed(
  addr: BlockAddress,
  display: DisplaySettingsBlock,
): boolean {
  return (
    addr.id !== null &&
    !!display?.data.widgets.find((w) =>
      Object.values(w).find((v) => isLink(v) && v.id === addr.id),
    )
  );
}

export const isBlockClaimed = (
  block: Maybe<Block>,
  claims: Mapped<BlockClaim[]>,
): boolean =>
  block != null &&
  !!claims[block.serviceId]?.some((claim) => claim.target === block.id);

export const isSparkState = (data: unknown): data is SparkStateEvent =>
  (data as SparkStateEvent).type === 'Spark.state';

export const isSparkPatch = (data: unknown): data is SparkPatchEvent =>
  (data as SparkPatchEvent).type === 'Spark.patch';

export const isSparkUpdate = (data: unknown): data is SparkUpdateEvent =>
  (data as SparkUpdateEvent).type === 'Spark.update';
