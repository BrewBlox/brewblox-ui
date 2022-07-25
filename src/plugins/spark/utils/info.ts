import { useFeatureStore } from '@/store/features';
import { isLink } from '@/utils/identity';
import {
  Block,
  BlockDriveChain,
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
import { Enum } from 'typescript-string-enums';
import { BlockAddress, ComparedBlockType } from '../types';

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
  return Boolean(COMPATIBLE_TYPES[intf]?.includes(type));
}

export function ifCompatible<T extends Block>(
  block: Maybe<Block>,
  intf: ComparedBlockType,
): T | null {
  return block && isCompatible(block.type, intf) ? (block as T) : null;
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

export function isBlockVolatile(block: Maybe<Block>): boolean {
  return block?.meta?.volatile === true;
}

export function isBlockRemovable(block: Maybe<Block>): boolean {
  return (
    block != null &&
    !isBlockVolatile(block) &&
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

export const isBlockDriven = (
  block: Maybe<Block>,
  chains: Mapped<BlockDriveChain[]>,
): boolean =>
  block != null &&
  !!chains[block.serviceId]?.some((chain) => chain.target === block.id);

export const isSparkState = (data: unknown): data is SparkStateEvent =>
  (data as SparkStateEvent).type === 'Spark.state';

export const isSparkPatch = (data: unknown): data is SparkPatchEvent =>
  (data as SparkPatchEvent).type === 'Spark.patch';

export const isSparkUpdate = (data: unknown): data is SparkUpdateEvent =>
  (data as SparkUpdateEvent).type === 'Spark.update';
