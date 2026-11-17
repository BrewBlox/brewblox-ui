import { mount, VueWrapper } from '@vue/test-utils';
import {
  AdcError,
  AnalogModuleChannel,
  AnalogSensorType,
  Block,
  BlockType,
} from 'brewblox-proto/ts';
import { createPinia, setActivePinia } from 'pinia';
import { describe, expect, it } from 'vitest';
import LabeledField from '@/components/form/LabeledField.vue';
import { useSparkStore } from '@/plugins/spark/store';
import { bloxLink } from '@/utils/link';
import AnalogArrayEditor from '../AnalogArrayEditor.vue';

const channel = (id: number, error?: AdcError): AnalogModuleChannel =>
  ({
    id,
    sensorType: AnalogSensorType.ANALOG_SENSOR_TYPE_RTD_3WIRE,
    ...(error && { error }),
  }) as AnalogModuleChannel;

const sensor = (id: string, analogChannel: number): Block =>
  ({
    id,
    serviceId: 'sparkey',
    type: BlockType.TempSensorAnalog,
    data: { analogDevice: bloxLink('GPIO'), analogChannel },
  }) as unknown as Block;

function mountEditor(
  channels: AnalogModuleChannel[],
  blocks: Block[] = [],
): VueWrapper {
  setActivePinia(createPinia());
  useSparkStore().$patch((state) => {
    state.serviceIds = ['sparkey'];
    state.blocks = { sparkey: blocks };
  });
  return mount(AnalogArrayEditor, {
    props: {
      channels,
      address: { serviceId: 'sparkey', id: 'GPIO', type: BlockType.GpioModule },
    },
    global: {
      components: { LabeledField },
      stubs: { NumberField: true, QuantityField: true },
    },
  });
}

/** The text of each channel row's field with this label */
const fieldTexts = (wrapper: VueWrapper, label: string): string[] =>
  wrapper
    .findAllComponents(LabeledField)
    .filter((f) => f.props('label') === label)
    .map((f) => f.text());

describe('AnalogArrayEditor', () => {
  it('shows what stopped a channel ADC, and nothing for a channel that is OK', () => {
    const wrapper = mountEditor([
      channel(1, AdcError.ADC_ERROR_DATA_READY_TIMEOUT),
      channel(3, AdcError.ADC_ERROR_OK),
      channel(4),
    ]);

    const errors = fieldTexts(wrapper, 'ADC stopped');
    expect(errors).toHaveLength(1);
    expect(errors[0]).toContain('No data in time');
  });

  it('lists every sensor that reads a channel', () => {
    const wrapper = mountEditor(
      [channel(1), channel(2)],
      [sensor('Sensor A', 1), sensor('Sensor B', 1), sensor('Sensor C', 2)],
    );

    const used = fieldTexts(wrapper, 'Used by');
    expect(used).toHaveLength(2);
    expect(used[0]).toContain('Sensor A');
    expect(used[0]).toContain('Sensor B');
    expect(used[0]).not.toContain('Sensor C');
    expect(used[1]).toContain('Sensor C');
  });
});
