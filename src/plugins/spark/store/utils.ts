import { Block } from '@/shared-types';
import { ServiceStatus } from '@/store/services';
import { findById } from '@/utils/collections';

import {
  BlockAddress,
  BlockFieldAddress,
  SparkStatusDescription,
} from '../types';

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

function statusDesc(status: SparkStatusDescription | null): [string, string] {
  if (!status) {
    return ['unreachable', 'red'];
  }
  const cs = status.connection_status;

  if (cs === 'DISCONNECTED') {
    return ['Waiting for connection', 'red'];
  }

  if (cs === 'CONNECTED') {
    return ['Waiting for handshake', 'yellow'];
  }

  if (cs === 'ACKNOWLEDGED') {
    if (status.firmware_error === 'INCOMPATIBLE') {
      return ['Incompatible firmware', 'orange'];
    } else if (status.identity_error === 'INCOMPATIBLE') {
      return ['Invalid device ID', 'orange'];
    } else {
      return ['Waiting for synchronization', 'yellow'];
    }
  }

  if (cs === 'UPDATING') {
    return ['Updating', 'orange'];
  }

  if (cs === 'SYNCHRONIZED') {
    if (status.firmware_error == 'MISMATCHED') {
      return ['Firmware update available', 'lime'];
    } else if (status.identity_error === 'WILDCARD_ID') {
      return ['Service --device-id not set', 'lime'];
    } else {
      return ['Synchronized', 'green'];
    }
  }

  return ['Unknown', 'red'];
}

const iconOpts = {
  SIMULATION: 'mdi-console',
  LAN: 'mdi-access-point',
  USB: 'mdi-usb-port',
};

export function asServiceStatus(
  id: string,
  status: SparkStatusDescription | null,
): ServiceStatus {
  const [desc, color] = statusDesc(status);
  const icon = status?.connection_kind
    ? iconOpts[status.connection_kind]
    : undefined;
  return { id, color, desc, icon };
}
