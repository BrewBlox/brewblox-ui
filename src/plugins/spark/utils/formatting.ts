import { Enum } from 'typescript-string-enums';

import { sparkStore } from '@/plugins/spark/store';
import {
  AnyConstraint,
  AnyConstraintsObj,
  BlockAddress,
} from '@/plugins/spark/types';
import {
  Block,
  BlockType,
  DS2408Block,
  OneWireGpioModuleBlock,
} from '@/shared-types';
import { prettyLink } from '@/utils/formatting';
import { notify } from '@/utils/notify';
import { matchesType } from '@/utils/objects';
import { durationString } from '@/utils/quantity';

import { ioChannelNames } from '../const';

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
  const module = sparkStore.moduleById(serviceId);
  if (!module) {
    return;
  }
  const names = await module.cleanUnusedNames();

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

export function channelName(block: Block, id: number): string | undefined {
  if (matchesType<DS2408Block>(BlockType.DS2408, block)) {
    return ioChannelNames[block.data.connectMode][id];
  }
  if (matchesType<OneWireGpioModuleBlock>(BlockType.OneWireGpioModule, block)) {
    return block.data.channels.find((c) => c.id === id)?.name;
  }
  return ioChannelNames[block.type]?.[id];
}
