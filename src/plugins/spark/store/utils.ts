import capitalize from 'lodash/capitalize';

import { Block } from '@/shared-types';
import { ServiceStatus } from '@/store/services';
import { findById } from '@/utils/collections';

import { ApiSparkStatus, BlockAddress, BlockFieldAddress } from '../types';
import { SparkStatus } from '../types';

export function findBlockById<T extends Block>(
  blocks: Block[],
  id: Maybe<string>,
): T | null {
  return findById(blocks, id) as T | null;
}

export function findBlockByAddress<T extends Block>(
  blocks: Block[],
  addr: T | Maybe<BlockAddress>,
): T | null {
  if (!addr || !addr.id) {
    return null;
  }
  return (
    (blocks.find(
      (v) => v.id === addr.id && (!addr.type || addr.type === v.type),
    ) as T) ?? null
  );
}

export function findBlockFieldByAddress(
  blocks: Block[],
  addr: Maybe<BlockFieldAddress>,
): any | null {
  const block = findBlockByAddress(blocks, addr);
  if (!block || !addr?.field) {
    return null;
  }
  return block.data[addr.field] ?? null;
}

export function asSparkStatus(
  serviceId: string,
  status: ApiSparkStatus | null,
): SparkStatus {
  if (!status) {
    return {
      serviceId,
      isServiceReachable: false,
      deviceAddress: null,
      connectionKind: null,
    };
  }

  return {
    serviceId,
    isServiceReachable: true,
    deviceAddress: status.device_address,
    devicePlatform: status.device_info?.platform,
    connectionKind: status.connection_kind,
    isCompatibleFirmware: status.handshake_info?.is_compatible_firmware,
    isLatestFirmware: status.handshake_info?.is_latest_firmware,
    isValidDeviceId: status.handshake_info?.is_valid_device_id,
    isAutoconnecting: status.is_autoconnecting,
    isConnected: status.is_connected,
    isAcknowledged: status.is_acknowledged,
    isSynchronized: status.is_synchronized,
    isUpdating: status.is_updating,
  };
}

function statusDesc(status: SparkStatus): [string, string] {
  if (status.isConnected) {
    if (status.isSynchronized) {
      return ['synchronized', 'green'];
    } else if (status.isCompatibleFirmware) {
      return ['synchronizing', 'yellow'];
    } else if (status.isAcknowledged) {
      return ['incompatible firmware', 'orange'];
    } else {
      return ['Waiting for handshake', 'yellow'];
    }
  } else if (status.isServiceReachable) {
    return ['waiting for connection', 'red'];
  } else {
    return ['unreachable', 'red'];
  }
}

const iconOpts = {
  simulation: 'mdi-console',
  wifi: 'mdi-access-point',
  usb: 'mdi-usb-port',
  unknown: undefined,
};

export function asServiceStatus(status: SparkStatus): ServiceStatus {
  const id = status.serviceId;
  const [descText, color] = statusDesc(status);
  const connectionKind = status.connectionKind ?? 'unknown';
  const icon = iconOpts[connectionKind];
  const desc = capitalize(`${connectionKind} (${descText})`);
  return { id, color, desc, icon };
}
