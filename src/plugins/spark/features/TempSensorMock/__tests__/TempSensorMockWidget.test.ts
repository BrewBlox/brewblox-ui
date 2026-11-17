import {
  BlockType,
  TempSensorMockBlock,
  TempSensorMockFluctuatingBlock,
} from 'brewblox-proto/ts';
import { describe, expect, it } from 'vitest';
import { defineComponent } from 'vue';
import { bloxQty, deltaTempQty, tempQty } from '@/utils/quantity';
import { mountBlockWidget } from '../../../../../../test/block-widget';
import TempSensorMockWidget from '../TempSensorMockWidget.vue';

const DurationField = defineComponent({
  name: 'DurationField',
  props: { modelValue: { type: Object, default: null } },
  render: () => null,
});

const stubs = {
  BlockHistoryGraph: true,
  BlockWidgetToolbar: true,
  DurationField,
  LabeledField: true,
  PreviewCard: true,
  QuantityField: true,
  SensorSvgIcon: true,
  SettingValueField: true,
  SetpointSvgIcon: true,
};

const data = {
  value: tempQty(20),
  setting: tempQty(20),
  connected: true,
};

const mock: TempSensorMockBlock = {
  id: 'Mock',
  serviceId: 'sparkey',
  type: BlockType.TempSensorMock,
  data,
};

const fluctuating: TempSensorMockFluctuatingBlock = {
  id: 'Fluctuating',
  serviceId: 'sparkey',
  type: BlockType.TempSensorMockFluctuating,
  data: {
    ...data,
    fluctuations: [{ amplitude: deltaTempQty(1), period: bloxQty('10s') }],
  },
};

describe('TempSensorMockWidget', () => {
  it('shows no fluctuations for a mock without them', () => {
    const wrapper = mountBlockWidget(TempSensorMockWidget, mock, { stubs });

    expect(wrapper.text()).not.toContain('Fluctuations');
    expect(wrapper.findComponent(DurationField).exists()).toBe(false);
  });

  it('shows the fluctuations of a fluctuating mock', () => {
    const wrapper = mountBlockWidget(TempSensorMockWidget, fluctuating, {
      stubs,
    });

    expect(wrapper.text()).toContain('Fluctuations');
    expect(wrapper.findComponent(DurationField).props('modelValue')).toEqual(
      bloxQty('10s'),
    );
  });
});
