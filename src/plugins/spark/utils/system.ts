import {
  Block,
  DisplaySettingsBlock,
  Spark2PinsBlock,
  Spark3PinsBlock,
  SysInfoBlock,
  SystemBlockType,
  WiFiSettingsBlock,
} from 'brewblox-proto/ts';
import { useSparkStore } from '@/plugins/spark/store';
import { BlockSpec } from '@/plugins/spark/types';
import { makeTypeFilter } from '@/utils/functional';

type SysBlockFn<BlockT extends Block> = (
  serviceId: string | null | undefined,
) => BlockT | undefined;

export function getSysBlock<BlockT extends Block>(
  serviceId: string | null | undefined,
  type: BlockT['type'] & SystemBlockType,
): BlockT | undefined {
  return useSparkStore()
    .blocksByService(serviceId)
    .find(makeTypeFilter<BlockT>(type));
}

export const getDisplaySettingsBlock: SysBlockFn<DisplaySettingsBlock> = (
  serviceId,
) => getSysBlock(serviceId, SystemBlockType.DisplaySettings);

export const getSysInfoBlock: SysBlockFn<SysInfoBlock> = (serviceId) =>
  getSysBlock(serviceId, SystemBlockType.SysInfo);

/**
 * Whether the service's Spark can create blocks of a type, by the platforms its spec lists.
 * The handshake names the Spark's platform, so it is known before the blocks load.
 * True without a spec, for a type that lists no platforms, and while the Spark has not reported
 * its platform.
 */
export function canCreate(
  serviceId: string | null | undefined,
  spec: Maybe<Pick<BlockSpec, 'platforms'>>,
): boolean {
  const platforms = spec?.platforms;
  const platform =
    useSparkStore().statusByService(serviceId)?.controller?.platform;
  return !platforms || !platform || platforms.some((name) => name === platform);
}

export const getWiFiSettingsBlock: SysBlockFn<WiFiSettingsBlock> = (
  serviceId,
) => getSysBlock(serviceId, SystemBlockType.WiFiSettings);

export const getSpark2PinsBlock: SysBlockFn<Spark2PinsBlock> = (serviceId) =>
  getSysBlock(serviceId, SystemBlockType.Spark2Pins);

export const getSpark3PinsBlock: SysBlockFn<Spark3PinsBlock> = (serviceId) =>
  getSysBlock(serviceId, SystemBlockType.Spark3Pins);
