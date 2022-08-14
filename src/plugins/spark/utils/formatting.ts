import { useSparkStore } from '@/plugins/spark/store';
import { BlockAddress, BlockLimitation } from '@/plugins/spark/types';
import { notify } from '@/utils/notify';
import { matchesType } from '@/utils/objects';
import { durationString, prettyLink } from '@/utils/quantity';
import {
  AnalogConstraint,
  AnalogConstraintKey,
  AnyConstraint,
  AnyConstraintKey,
  AnyConstraintsObj,
  Block,
  BlockType,
  DigitalConstraint,
  DigitalConstraintKey,
  DS2408Block,
  OneWireGpioModuleBlock,
} from 'brewblox-proto/ts';
import get from 'lodash/get';
import { Enum } from 'typescript-string-enums';
import { constraintLabels, ioChannelNames } from '../const';

export const prettyBlock = (v: BlockAddress | null | undefined): string =>
  v?.id || '<not set>';

export const prettifyConstraints = (
  obj: AnyConstraintsObj | undefined,
): string =>
  obj === undefined || obj.constraints.length === 0
    ? '<no constraints>'
    : obj.constraints
        .map((c: AnyConstraint) => {
          // Analog
          if ('min' in c) {
            return `Minimum = ${c.min}`;
          }
          if ('max' in c) {
            return `Maximum = ${c.max}`;
          }
          if ('balanced' in c) {
            return `Balanced by ${prettyLink(c.balanced.balancerId)}`;
          }
          // Digital
          if ('minOff' in c) {
            return `Minimum OFF = ${durationString(c.minOff)}`;
          }
          if ('minOn' in c) {
            return `Minimum ON = ${durationString(c.minOn)}`;
          }
          if ('mutexed' in c) {
            return `Mutexed by ${prettyLink(c.mutexed.mutexId)}`;
          }
          if ('delayedOn' in c) {
            return `Delayed ON = ${durationString(c.delayedOn)}`;
          }
          if ('delayedOff' in c) {
            return `Delayed OFF = ${durationString(c.delayedOff)}`;
          }
          // Fallback
          return 'Unknown constraint';
        })
        .sort()
        .join(', ');

export async function cleanUnusedNames(
  serviceId: string | null,
): Promise<void> {
  const sparkStore = useSparkStore();
  if (!sparkStore.has(serviceId)) {
    return;
  }
  const names = await sparkStore.cleanUnusedNames(serviceId);

  const message =
    names.length > 0
      ? `Cleaned block names: <i>${names.join(', ')}</i>.`
      : 'No unused names found.';

  notify.info({ message, icon: 'mdi-tag-remove' });
}

export const enumHint = (e: Enum<any>): string =>
  'One of: ' +
  Enum.values(e)
    .map((v) => `'${v}'`)
    .join(', ');

export function channelName(
  block: Maybe<Block>,
  id: number,
): string | undefined {
  if (block == null) {
    return undefined;
  }
  if (matchesType<DS2408Block>(BlockType.DS2408, block)) {
    return ioChannelNames[block.type][block.data.connectMode][id];
  }
  if (matchesType<OneWireGpioModuleBlock>(BlockType.OneWireGpioModule, block)) {
    return block.data.channels.find((c) => c.id === id)?.name;
  }
  return ioChannelNames[block.type]?.[id];
}

export function isDigitalConstraint(
  constraint: AnyConstraint,
): constraint is DigitalConstraint {
  return (constraint as DigitalConstraint).remaining !== undefined;
}

export function isAnalogConstraint(
  constraint: AnyConstraint,
): constraint is AnalogConstraint {
  return (constraint as AnalogConstraint).limiting !== undefined;
}

export function constraintKey(
  constraint: DigitalConstraint,
): DigitalConstraintKey;
export function constraintKey(
  constraint: AnalogConstraint,
): AnalogConstraintKey;
export function constraintKey(constraint: AnyConstraint): AnyConstraintKey {
  return Object.keys(constraint).find(
    (k): k is AnyConstraintKey => k !== 'remaining' && k !== 'limiting',
  )!;
}

export function findLimitations(block: Block): BlockLimitation[] {
  const constraints: AnyConstraint[] = get(
    block,
    'data.constrainedBy.constraints',
    [],
  );
  const output: BlockLimitation[] = [];
  constraints.forEach((c: AnyConstraint) => {
    if (isDigitalConstraint(c) && c.remaining.value) {
      output.push({
        target: block.id,
        constraint: constraintKey(c),
        remaining: c.remaining,
      });
    } else if (isAnalogConstraint(c) && c.limiting) {
      output.push({
        target: block.id,
        constraint: constraintKey(c),
        remaining: null,
      });
    }
  });
  return output;
}

export function limitationString(
  limitations: BlockLimitation[],
): string | null {
  return (
    limitations
      .map(({ constraint, remaining }) =>
        remaining
          ? `${constraintLabels[constraint]} (${durationString(remaining)})`
          : `${constraintLabels[constraint]}`,
      )
      .join(', ') ?? null
  );
}
