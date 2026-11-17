import { Block, BlockType } from 'brewblox-proto/ts';
import { createPinia, setActivePinia } from 'pinia';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useSparkStore } from '@/plugins/spark/store';
import {
  claimedChannels,
  setExclusiveIoChannelClaimer,
} from '@/plugins/spark/utils/configuration';
import { bloxLink } from '@/utils/link';

const claimer = (
  id: string,
  type: BlockType,
  channel: number,
  hwDevice: string | null = 'DS',
): Block =>
  ({
    id,
    serviceId: 'sparkey',
    type,
    data: { hwDevice: bloxLink(hwDevice), channel },
  }) as unknown as Block;

const valve = claimer('Valve', BlockType.MotorValve, 1);
const onThree = claimer('On three', BlockType.DigitalActuator, 3);
const onFive = claimer('On five', BlockType.DigitalActuator, 5);
const elsewhere = claimer('Elsewhere', BlockType.DigitalActuator, 3, 'Other');
const loose = claimer('Loose', BlockType.DigitalActuator, 0, null);
const looseValve = claimer('Loose valve', BlockType.MotorValve, 0, null);

let unlinked: string[];
let assigned: string[];

beforeEach(() => {
  setActivePinia(createPinia());
  const sparkStore = useSparkStore();
  sparkStore.$patch((state) => {
    state.serviceIds = ['sparkey'];
    state.blocks = {
      sparkey: [valve, onThree, onFive, elsewhere, loose, looseValve],
    };
  });
  unlinked = [];
  assigned = [];
  vi.spyOn(sparkStore, 'patchBlock').mockImplementation(async (block, data) => {
    (data?.channel ? assigned : unlinked).push(block!.id);
    return null;
  });
});

describe('claimedChannels', () => {
  it('gives a valve four channels from its start channel', () => {
    expect(claimedChannels(BlockType.MotorValve, 5)).toEqual([5, 6, 7, 8]);
    expect(claimedChannels(BlockType.DigitalActuator, 5)).toEqual([5]);
    expect(claimedChannels(BlockType.MotorValve, 0)).toEqual([]);
  });
});

describe('setExclusiveIoChannelClaimer', () => {
  it('frees the valve that holds the channel an actuator takes', async () => {
    await setExclusiveIoChannelClaimer(loose, bloxLink('DS'), 2);

    expect(unlinked).toEqual(['Valve']);
    expect(assigned).toEqual(['Loose']);
  });

  it('frees every actuator on the channels a valve takes', async () => {
    await setExclusiveIoChannelClaimer(looseValve, bloxLink('DS'), 3);

    expect(unlinked.sort()).toEqual(['On five', 'On three', 'Valve']);
  });

  it('leaves the channels of another device alone', async () => {
    await setExclusiveIoChannelClaimer(looseValve, bloxLink('DS'), 5);

    expect(unlinked).toEqual(['On five']);
  });

  it('does not free a valve that moves over its own channels', async () => {
    await setExclusiveIoChannelClaimer(valve, bloxLink('DS'), 2);

    expect(unlinked.sort()).toEqual(['On five', 'On three']);
    expect(assigned).toEqual(['Valve']);
  });

  it('frees the holder when a block takes the channel it already has', async () => {
    await setExclusiveIoChannelClaimer(onThree, bloxLink('DS'), 3);

    expect(unlinked).toEqual(['Valve']);
    expect(assigned).toEqual([]);
  });
});
