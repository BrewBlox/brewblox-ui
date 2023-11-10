import {
  AnalogConstraints,
  Block,
  BlockType,
  CHANNEL_NAMES_DS2408,
  CHANNEL_NAMES_DS2413,
  CHANNEL_NAMES_MOCK_PINS,
  CHANNEL_NAMES_SPARK_2,
  CHANNEL_NAMES_SPARK_3,
  DigitalConstraints,
  DS2408Block,
  OneWireGpioModuleBlock,
} from 'brewblox-proto/ts';
import { Enum } from 'typescript-string-enums';
import { useSparkStore } from '@/plugins/spark/store';
import { BlockAddress } from '@/plugins/spark/types';
import { notify } from '@/utils/notify';
import { matchesType } from '@/utils/objects';
import { durationString, prettyLink } from '@/utils/quantity';

export const prettyBlock = (v: BlockAddress | null | undefined): string =>
  v?.id || '<not set>';

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
  if (block.type === BlockType.MockPins) {
    return CHANNEL_NAMES_MOCK_PINS[id];
  }
  if (block.type === BlockType.Spark2Pins) {
    return CHANNEL_NAMES_SPARK_2[id];
  }
  if (block.type === BlockType.Spark3Pins) {
    return CHANNEL_NAMES_SPARK_3[id];
  }
  if (block.type === BlockType.DS2413) {
    return CHANNEL_NAMES_DS2413[id];
  }
  if (matchesType<DS2408Block>(BlockType.DS2408, block)) {
    return CHANNEL_NAMES_DS2408[block.data.connectMode][id];
  }
  if (matchesType<OneWireGpioModuleBlock>(BlockType.OneWireGpioModule, block)) {
    return block.data.channels.find((c) => c.id === id)?.name;
  }
  return undefined;
}

export function prettyConstraints(
  constraints: Maybe<AnalogConstraints | DigitalConstraints>,
): string {
  if (constraints == null) {
    return '';
  }

  const output: string[] = [];
  const { min, max, balanced } = constraints as AnalogConstraints;
  const { minOff, minOn, delayedOff, delayedOn, mutexed } =
    constraints as DigitalConstraints;

  if (min?.enabled) {
    output.push(`Minimum = ${min.value}`);
  }

  if (max?.enabled) {
    output.push(`Maximum = ${max.value}`);
  }

  if (balanced?.enabled) {
    output.push(`Balanced by ${prettyLink(balanced.balancerId)}`);
  }

  if (minOff?.enabled) {
    output.push(`Minimum OFF = ${durationString(minOff.duration)}`);
  }

  if (minOn?.enabled) {
    output.push(`Minimum ON = ${durationString(minOn.duration)}`);
  }

  if (delayedOff?.enabled) {
    output.push(`Delay OFF = ${durationString(delayedOff.duration)}`);
  }

  if (delayedOn?.enabled) {
    output.push(`Delay ON = ${durationString(delayedOn.duration)}`);
  }

  if (mutexed?.enabled) {
    output.push(
      `Mutually exclusive = ${durationString(mutexed.extraHoldTime)}` +
        ` by ${prettyLink(mutexed.mutexId)}`,
    );
  }

  return output.join(', ');
}

export function prettyLimitations(
  constraints: Maybe<AnalogConstraints | DigitalConstraints>,
): string {
  if (constraints == null) {
    return '';
  }

  const output: string[] = [];
  const { min, max, balanced } = constraints as AnalogConstraints;
  const { minOff, minOn, delayedOff, delayedOn, mutexed } =
    constraints as DigitalConstraints;

  if (min?.enabled && min?.limiting) {
    output.push(`Minimum (${min.value})`);
  }

  if (max?.enabled && max?.limiting) {
    output.push(`Maximum (${max.value})`);
  }

  if (balanced?.enabled && balanced?.limiting) {
    output.push(`Balanced (${balanced.granted})`);
  }

  if (minOn?.enabled && minOn?.limiting) {
    output.push(`Minimum ON (${durationString(minOn.remaining)})`);
  }

  if (minOff?.enabled && minOff?.limiting) {
    output.push(`Minimum OFF (${durationString(minOff.remaining)})`);
  }

  if (delayedOn?.enabled && delayedOn?.limiting) {
    output.push(`Delay ON (${durationString(delayedOn.remaining)})`);
  }

  if (delayedOff?.enabled && delayedOff?.limiting) {
    output.push(`Delay OFF (${durationString(delayedOff.remaining)})`);
  }

  if (mutexed?.enabled && mutexed?.limiting) {
    output.push(`Mutually exclusive (${durationString(mutexed.remaining)})`);
  }

  return output.join(', ');
}
