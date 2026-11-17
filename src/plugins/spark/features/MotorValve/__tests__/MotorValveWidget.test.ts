import {
  Block,
  BlockIntfType,
  BlockType,
  ChannelCapabilities,
  DigitalState,
  DS2408ConnectMode,
  MotorValveBlock,
  SettingMode,
  ValveState,
} from 'brewblox-proto/ts';
import { describe, expect, it } from 'vitest';
import { bloxLink } from '@/utils/link';
import {
  mountBlockWidget,
  slotStub,
} from '../../../../../../test/block-widget';
import MotorValveWidget from '../MotorValveWidget.vue';

const valve = (valveState: ValveState | null): MotorValveBlock => ({
  id: 'Valve',
  serviceId: 'sparkey',
  type: BlockType.MotorValve,
  data: {
    hwDevice: bloxLink('DS', BlockIntfType.DS2408Interface),
    channel: 1,
    storedState: DigitalState.STATE_INACTIVE,
    desiredState: DigitalState.STATE_INACTIVE,
    state: valveState ? DigitalState.STATE_INACTIVE : null,
    valveState,
    constraints: {},
    claimedBy: bloxLink(null),
    settingMode: SettingMode.STORED,
  },
});

// In valve mode a DS2408 reports only the valves' start channels
const ds2408: Block = {
  id: 'DS',
  serviceId: 'sparkey',
  type: BlockType.DS2408,
  data: {
    connectMode: DS2408ConnectMode.CONNECT_VALVE,
    channels: [5, 1].map((id) => ({
      id,
      capabilities: ChannelCapabilities.CHAN_SUPPORTS_BIDIRECTIONAL,
      claimedBy: bloxLink(null),
    })),
  },
};

const actuator = (id: string, channel: number): Block =>
  ({
    id,
    serviceId: 'sparkey',
    type: BlockType.DigitalActuator,
    data: { hwDevice: bloxLink('DS'), channel },
  }) as unknown as Block;

const text = (block: MotorValveBlock, others: Block[]): string =>
  mountBlockWidget(MotorValveWidget, block, {
    others,
    mode: 'Basic',
    stubs: {
      BlockHistoryGraph: true,
      BlockWidgetToolbar: true,
      CardWarning: slotStub('message'),
      PreviewCard: true,
    },
  }).text();

describe('MotorValveWidget', () => {
  it('names the block on one of its channels that the device does not report', () => {
    expect(text(valve(null), [ds2408, actuator('Pump', 3)])).toContain(
      'This Motor Valve drives nothing: Pump holds one of its channels.',
    );
  });

  it('names every block on its channels', () => {
    const others = [ds2408, actuator('Pump', 2), actuator('Heater', 4)];
    expect(text(valve(null), others)).toContain(
      'This Motor Valve drives nothing: Pump, Heater hold some of its channels.',
    );
  });

  it('names a device that is gone', () => {
    expect(text(valve(null), [])).toContain(
      'This Motor Valve drives nothing: its device DS is gone.',
    );
  });

  it('warns of nothing for a block on the other valve', () => {
    expect(text(valve(null), [ds2408, actuator('Pump', 6)])).not.toContain(
      'drives nothing',
    );
  });

  it('warns of nothing while it reports a valve state', () => {
    expect(
      text(valve(ValveState.VALVE_CLOSED), [ds2408, actuator('Pump', 3)]),
    ).not.toContain('drives nothing');
  });
});
