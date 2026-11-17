import { mount } from '@vue/test-utils';
import {
  Block,
  BlockIntfType,
  BlockOrIntfType,
  BlockType,
  ChannelCapabilities,
  DS2408ConnectMode,
} from 'brewblox-proto/ts';
import { createPinia, setActivePinia } from 'pinia';
import { describe, expect, it } from 'vitest';
import { defineComponent } from 'vue';
import { useSparkStore } from '@/plugins/spark/store';
import { bloxLink } from '@/utils/link';
import ChannelSelectField from '../ChannelSelectField.vue';

const SelectField = defineComponent({
  name: 'SelectField',
  props: { options: { type: Array, default: () => [] } },
  template: '<div />',
});

const bidirectional = ChannelCapabilities.CHAN_SUPPORTS_BIDIRECTIONAL;

const pins: Block = {
  id: 'Pins',
  serviceId: 'sparkey',
  type: BlockType.MockPins,
  data: {
    channels: [1, 2, 3].map((id) => ({
      id,
      capabilities: bidirectional,
      claimedBy: bloxLink(id === 2 ? 'Pump' : null),
    })),
  },
};

// In valve mode a DS2408 reports only the valves' start channels
const ds2408: Block = {
  id: 'DS',
  serviceId: 'sparkey',
  type: BlockType.DS2408,
  data: {
    connectMode: DS2408ConnectMode.CONNECT_VALVE,
    channels: [5, 1].map((id) => ({
      id,
      capabilities: bidirectional,
      claimedBy: bloxLink(null),
    })),
  },
};

const valve = {
  id: 'Valve',
  serviceId: 'sparkey',
  type: BlockType.MotorValve,
  data: { hwDevice: bloxLink(null), channel: 0 },
} as unknown as Block;

const pump = {
  id: 'Pump',
  serviceId: 'sparkey',
  type: BlockType.DigitalActuator,
  data: { hwDevice: bloxLink('Pins'), channel: 2 },
} as unknown as Block;

const heater = {
  id: 'Heater',
  serviceId: 'sparkey',
  type: BlockType.DigitalActuator,
  data: { hwDevice: bloxLink('DS'), channel: 3 },
} as unknown as Block;

function options(
  props: { claimer?: Block; deviceType?: BlockOrIntfType } = {},
): SelectOption[] {
  setActivePinia(createPinia());
  useSparkStore().$patch((state) => {
    state.serviceIds = ['sparkey'];
    state.blocks = { sparkey: [pins, ds2408, heater, pump, valve] };
  });
  return mount(ChannelSelectField, {
    props: {
      serviceId: 'sparkey',
      modelValue: { hwDevice: bloxLink(null), channel: 0 },
      ...props,
    },
    global: { stubs: { SelectField } },
  })
    .findComponent(SelectField)
    .props('options') as SelectOption[];
}

const labelOf = (opts: SelectOption[], value: string): string | undefined =>
  opts.find((o) => o.value === value)?.label;

describe('ChannelSelectField', () => {
  it('names the holder of the one channel a block takes', () => {
    const opts = options();
    expect(labelOf(opts, 'Pins/2')).toContain('(replace Pump)');
    expect(labelOf(opts, 'Pins/3')).not.toContain('replace');
  });

  it('names a block on the channels a valve takes that the device does not report', () => {
    const opts = options({ claimer: valve });
    expect(labelOf(opts, 'DS/1')).toContain('(replace Heater)');
    expect(labelOf(opts, 'DS/5')).not.toContain('replace');
  });

  it('does not name the block that takes the channel', () => {
    expect(labelOf(options({ claimer: pump }), 'Pins/2')).not.toContain(
      'replace',
    );
  });

  it('lists the devices of its device type alone', () => {
    const opts = options({ deviceType: BlockIntfType.DS2408Interface });
    expect(opts.map((o) => o.value).sort()).toEqual(['DS/1', 'DS/5']);
  });
});
