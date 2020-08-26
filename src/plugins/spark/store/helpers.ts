import { isLink, prettyQty } from '@/helpers/bloxfield';
import { capitalized } from '@/helpers/functional';
import { ServiceStatus } from '@/store/services';

import { constraintLabels } from '../getters';
import { ApiSparkStatus, Block } from '../types';
import { AnalogConstraint, DigitalConstraint, Limiters, RelationEdge, SparkStatus } from '../types';

export const calculateDrivenChains = (blocks: Block[]): string[][] => {
  const output: string[][] = [];

  const drivenBlocks: { [driven: string]: string[] } = {};

  for (const block of blocks) {
    Object
      .values(block.data)
      .filter((obj: any) => isLink(obj) && obj.driven && obj.id)
      .forEach((obj: any) => {
        const existing = drivenBlocks[obj.id] || [];
        drivenBlocks[obj.id] = [...existing, block.id];
      });
  }

  const generateChains =
    (chain: string[], latest: string): string[][] => {
      const additional: string[] = drivenBlocks[latest];
      if (!additional) {
        return [[...chain, latest]];
      }
      return additional
        .filter(id => !chain.includes(id))
        .reduce(
          (chains: string[][], id: string) => [...chains, ...generateChains([...chain, latest], id)],
          [],
        );
    };

  Object.keys(drivenBlocks)
    .forEach(key => { output.push(...generateChains([], key)); });

  return output;
};

export const calculateRelations = (blocks: Block[]): RelationEdge[] => {
  const linkArray: RelationEdge[] = [];

  const findRelations =
    (source: string, relation: string[], val: any): RelationEdge[] => {
      if (isLink(val)) {
        if (val.id === null || source === 'DisplaySettings') {
          return linkArray;
        }
        return [{
          source: source,
          target: val.id,
          relation: relation,
        }];
      }
      if (val instanceof Object) {
        return Object.entries(val)
          .reduce(
            (acc, child: Mapped<any>) => {
              if (child[0].startsWith('driven')) {
                return acc;
              }
              // intentional copy of acc
              return [...acc, ...findRelations(source, [...relation, child[0]], child[1])];
            },
            linkArray
          );
      }
      return linkArray;
    };

  const allLinks: RelationEdge[] = [];
  for (const block of blocks) {
    allLinks.push(...findRelations(block.id, [], block.data));
  }

  return allLinks;
};

export const calculateLimiters = (blocks: Block[]): Limiters => {
  const limited: Limiters = {};

  for (const block of blocks) {
    if (!('constrainedBy' in block.data)) {
      continue;
    }
    const { constraints } = block.data.constrainedBy;
    if (!constraints || constraints.length === 0) {
      continue;
    }

    const isDigital = 'remaining' in constraints[0];

    if (isDigital) {
      limited[block.id] = (constraints as DigitalConstraint[])
        .filter(c => c.remaining?.value)
        .map(c => {
          const key = Object.keys(c).find(key => key !== 'remaining') ?? '??';
          const label = constraintLabels[key] ?? key;
          return `${label} (${prettyQty(c.remaining)})`;
        });
    }
    else {
      limited[block.id] = (constraints as AnalogConstraint[])
        .filter(c => c.limiting)
        .map(c => Object.keys(c).find(key => key !== 'limiting') ?? '??')
        .map(k => constraintLabels[k]);
    }
  }

  return limited;
};

export const asSparkStatus = (serviceId: string, status: ApiSparkStatus | null): SparkStatus => {
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
    connectionKind: status.connection_kind,
    isCompatibleFirmware: status.handshake_info?.is_compatible_firmware,
    isLatestFirmware: status.handshake_info?.is_latest_firmware,
    isValidDeviceId: status.handshake_info?.is_valid_device_id,
    isAutoconnecting: status.is_autoconnecting,
    isConnected: status.is_connected,
    isAcknowledged: status.is_acknowledged,
    isSynchronized: status.is_synchronized,
  };
};

const statusDesc = (status: SparkStatus): [string, string] => {
  if (status.isConnected) {
    if (status.isSynchronized) {
      return ['synchronized', 'green'];
    }
    else if (status.isCompatibleFirmware) {
      return ['synchronizing', 'yellow'];
    }
    else if (status.isAcknowledged) {
      return ['incompatible firmware', 'orange'];
    }
    else {
      return ['Waiting for handshake', 'yellow'];
    }
  }
  else if (status.isServiceReachable) {
    return ['waiting for connection', 'red'];
  }
  else {
    return ['unreachable', 'red'];
  }
};

const iconOpts = {
  simulation: 'mdi-console',
  wifi: 'mdi-access-point',
  usb: 'mdi-usb-port',
  unknown: undefined,
};

export const asServiceStatus =
  (status: SparkStatus): ServiceStatus => {
    const id = status.serviceId;
    const [descText, color] = statusDesc(status);
    const connectionKind = status.connectionKind ?? 'unknown';
    const icon = iconOpts[connectionKind];
    const desc = capitalized(`${connectionKind} (${descText})`);
    return { id, color, desc, icon };
  };
