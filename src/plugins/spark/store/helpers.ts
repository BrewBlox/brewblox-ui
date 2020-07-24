import { capitalized } from '@/helpers/functional';
import { Link } from '@/plugins/spark/bloxfield';
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
      .filter((obj: any) => obj instanceof Link && obj.driven && obj.id)
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
      if (val instanceof Link) {
        if (val.id === null || source === 'DisplaySettings') {
          return linkArray;
        }
        return [{
          source: source,
          target: val.toString(),
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
          return `${label} (${c.remaining})`;
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

export const unknownStatus = (): ApiSparkStatus => ({
  type: 'Spark',
  autoconnecting: true,
  connect: false,
  handshake: false,
  synchronize: false,
  compatible: true, // no idea - assume yes
  latest: true, // no idea - assume yes
  valid: true, // no idea - assume yes
  info: [],
  address: null,
  connection: null,
});

export const asSparkStatus = (
  serviceId: string,
  status: ApiSparkStatus | null = null,
): SparkStatus => ({
  ...(status ?? unknownStatus()),
  serviceId,
  available: status !== null,
});

const statusDesc = (status: SparkStatus): [string, string] => {
  if (status.connect) {
    if (status.synchronize) {
      return ['synchronized', 'green'];
    }
    else if (status.compatible) {
      return ['synchronizing', 'yellow'];
    }
    else if (status.handshake) {
      return ['incompatible firmware', 'orange'];
    }
    else {
      return ['Waiting for handshake', 'yellow'];
    }
  }
  else if (status.available) {
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
    const connection = status.connection ?? 'unknown';
    const icon = iconOpts[connection];
    const desc = capitalized(`${connection} (${descText})`);
    return { id, color, desc, icon };
  };
