import { Block, BlockType, Link } from 'brewblox-proto/ts';
import { describe, expect, it } from 'vitest';
import { blockChain, ChainStep } from '@/plugins/spark/utils/chains';
import { bloxLink } from '@/utils/link';

const link = (id: string | null): Link => bloxLink(id);

const block = (
  id: string,
  data: Record<string, unknown>,
  type = 'Test',
): Block => ({ id, serviceId: 'sparkey', type, data }) as unknown as Block;

const setpoint = (id: string, data: Record<string, unknown>): Block =>
  block(id, data, BlockType.SetpointSensorPair);

/** A fermentation fridge: one setpoint, read by a heating and a cooling PID */
const fridge = (coolEnabled = true): Block[] => [
  setpoint('Beer Setting', { claimedBy: link(null) }),
  block('Cool PID', {
    enabled: coolEnabled,
    inputId: link('Beer Setting'),
    outputId: link('Cool PWM'),
  }),
  block('Heat PID', {
    enabled: true,
    inputId: link('Beer Setting'),
    outputId: link('Heat PWM'),
  }),
  block('Cool PWM', {
    actuatorId: link('Cool Actuator'),
    claimedBy: link(coolEnabled ? 'Cool PID' : null),
  }),
  block('Heat PWM', {
    actuatorId: link('Heat Actuator'),
    claimedBy: link('Heat PID'),
  }),
  block('Cool Actuator', {
    hwDevice: link('Pins'),
    channel: 2,
    claimedBy: link('Cool PWM'),
  }),
  block('Heat Actuator', {
    hwDevice: link('Pins'),
    channel: 1,
    claimedBy: link('Heat PWM'),
  }),
  block('Pins', {
    channels: [
      { id: 1, claimedBy: link('Heat Actuator') },
      { id: 2, claimedBy: link('Cool Actuator') },
    ],
  }),
];

const ids = (steps: ChainStep[]): string[] =>
  steps.map((s) => (s.channel != null ? `${s.id}:${s.channel}` : s.id));

describe('blockChain', () => {
  it('follows the chain from a PWM up to the setpoint and down to the pin', () => {
    const { steps, branches } = blockChain(fridge(), 'Cool PWM');
    expect(ids(steps)).toEqual([
      'Beer Setting',
      'Cool PID',
      'Cool PWM',
      'Cool Actuator',
      'Pins:2',
    ]);
    expect(steps.every((s) => s.active)).toBe(true);
    expect(branches).toEqual([]);
  });

  it('splits into branches below a setpoint read by two PIDs', () => {
    const { steps, branches } = blockChain(fridge(), 'Beer Setting');
    expect(ids(steps)).toEqual(['Beer Setting']);
    expect(branches.map(ids)).toEqual([
      ['Cool PID', 'Cool PWM', 'Cool Actuator', 'Pins:2'],
      ['Heat PID', 'Heat PWM', 'Heat Actuator', 'Pins:1'],
    ]);
    expect(branches.flat().every((s) => s.active)).toBe(true);
  });

  it('lists the enabled PID reading a setpoint first', () => {
    const { branches } = blockChain(fridge(false), 'Beer Setting');
    expect(branches.map((b) => b[0].id)).toEqual(['Heat PID', 'Cool PID']);
    // The disabled PID does not claim its PWM
    expect(branches[1].map((s) => s.active)).toEqual([true, false, true, true]);
  });

  it('does not split above the block', () => {
    const { steps, branches } = blockChain(fridge(), 'Heat Actuator');
    expect(ids(steps)).toEqual([
      'Beer Setting',
      'Heat PID',
      'Heat PWM',
      'Heat Actuator',
      'Pins:1',
    ]);
    expect(branches).toEqual([]);
  });

  it('keeps a disabled PID in the chain, as not driving', () => {
    const { steps } = blockChain(fridge(false), 'Cool Actuator');
    expect(ids(steps)).toEqual([
      'Beer Setting',
      'Cool PID',
      'Cool PWM',
      'Cool Actuator',
      'Pins:2',
    ]);
    expect(steps.map((s) => s.active)).toEqual([
      true,
      true, // a PID reads its input, enabled or not
      false, // not claimed by the disabled PID
      true,
      true,
    ]);
  });

  const herms = (): Block[] => [
    setpoint('MT Setpoint', {}),
    block('MT PID', {
      inputId: link('MT Setpoint'),
      outputId: link('HLT Driver'),
    }),
    block('HLT Driver', {
      targetId: link('HLT Setpoint'),
      referenceId: link('MT Setpoint'),
      claimedBy: link('MT PID'),
    }),
    setpoint('HLT Setpoint', { claimedBy: link('HLT Driver') }),
    block('HLT PID', {
      inputId: link('HLT Setpoint'),
      outputId: link('HLT PWM'),
    }),
    block('HLT PWM', { claimedBy: link('HLT PID') }),
  ];

  it('continues up through a setpoint driven by another PID', () => {
    expect(ids(blockChain(herms(), 'HLT PWM').steps)).toEqual([
      'MT Setpoint',
      'MT PID',
      'HLT Driver',
      'HLT Setpoint',
      'HLT PID',
      'HLT PWM',
    ]);
  });

  it('continues down through the setpoint a driver drives', () => {
    const { steps } = blockChain(herms(), 'HLT Driver');
    expect(ids(steps)).toEqual([
      'MT Setpoint',
      'MT PID',
      'HLT Driver',
      'HLT Setpoint',
      'HLT PID',
      'HLT PWM',
    ]);
    expect(steps.every((s) => s.active)).toBe(true);
  });

  it('starts at the block claiming a setpoint', () => {
    const blocks = [
      block('Profile', { targetId: link('Setpoint') }),
      block('Sequence', {}),
      setpoint('Setpoint', { claimedBy: link('Sequence') }),
    ];
    const { steps } = blockChain(blocks, 'Setpoint');
    expect(ids(steps)).toEqual(['Sequence', 'Setpoint']);
    expect(steps[0].alternatives).toEqual(['Profile']);
  });

  it('stops at a circular link', () => {
    const blocks = [
      block('A', { outputId: link('B'), claimedBy: link('B') }),
      block('B', { targetId: link('A'), claimedBy: link('A') }),
    ];
    expect(ids(blockChain(blocks, 'A').steps)).toEqual(['B', 'A']);
  });

  it('is only the block itself outside a chain, and empty for no block', () => {
    expect(ids(blockChain([block('Sensor', {})], 'Sensor').steps)).toEqual([
      'Sensor',
    ]);
    expect(blockChain([], 'Sensor')).toEqual({ steps: [], branches: [] });
  });
});
