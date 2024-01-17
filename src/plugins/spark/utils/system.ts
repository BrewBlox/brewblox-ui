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

export const getWiFiSettingsBlock: SysBlockFn<WiFiSettingsBlock> = (
  serviceId,
) => getSysBlock(serviceId, SystemBlockType.WiFiSettings);

export const getSpark2PinsBlock: SysBlockFn<Spark2PinsBlock> = (serviceId) =>
  getSysBlock(serviceId, SystemBlockType.Spark2Pins);

export const getSpark3PinsBlock: SysBlockFn<Spark3PinsBlock> = (serviceId) =>
  getSysBlock(serviceId, SystemBlockType.Spark3Pins);
