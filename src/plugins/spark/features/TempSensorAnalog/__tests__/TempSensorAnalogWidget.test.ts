import {
  AdcError,
  AnalogModuleChannel,
  AnalogSensorType,
  Block,
  BlockType,
  TempSensorAnalogBlock,
  TempSensorAnalogSpec,
  TempSensorAnalogType,
} from 'brewblox-proto/ts';
import { describe, expect, it } from 'vitest';
import { bloxLink } from '@/utils/link';
import { bloxQty, tempQty } from '@/utils/quantity';
import {
  mountBlockWidget,
  slotStub,
} from '../../../../../../test/block-widget';
import TempSensorAnalogWidget from '../TempSensorAnalogWidget.vue';

const sensor: TempSensorAnalogBlock = {
  id: 'Analog Sensor',
  serviceId: 'sparkey',
  type: BlockType.TempSensorAnalog,
  data: {
    value: tempQty(null),
    analogDevice: bloxLink('GPIO', BlockType.GpioModule),
    analogChannel: 1,
    sensorType: TempSensorAnalogType.TEMP_SENSOR_TYPE_RTD_3WIRE,
    detected: AnalogSensorType.ANALOG_SENSOR_TYPE_NONE,
    spec: TempSensorAnalogSpec.SPEC_PT100_385,
  },
};

const module = (error?: AdcError): Block =>
  ({
    id: 'GPIO',
    serviceId: 'sparkey',
    type: BlockType.GpioModule,
    data: {
      analogChannels: [
        {
          id: 1,
          sensorType: AnalogSensorType.ANALOG_SENSOR_TYPE_NONE,
          ...(error && { error }),
        } as AnalogModuleChannel,
      ],
    },
  }) as unknown as Block;

const warning = (others: Block[], block: Block = sensor): string =>
  mountBlockWidget(TempSensorAnalogWidget, block, {
    others,
    mode: 'Basic',
    stubs: {
      BlockHistoryGraph: true,
      BlockWidgetToolbar: true,
      CardWarning: slotStub('message'),
      PreviewCard: true,
      QuantityField: true,
    },
  }).text();

describe('TempSensorAnalogWidget', () => {
  it('names what stopped the ADC of its channel', () => {
    expect(warning([module(AdcError.ADC_ERROR_DATA_READY_TIMEOUT)])).toContain(
      'Its ADC on GPIO stopped: No data in time.',
    );
  });

  it('names no cause while its ADC is OK', () => {
    const text = warning([module(AdcError.ADC_ERROR_OK)]);

    expect(text).toContain('Analog Sensor could not be read.');
    expect(text).not.toContain('stopped');
  });

  it('names no cause when the firmware sends no error', () => {
    expect(warning([module()])).not.toContain('stopped');
  });

  it('asks for a spec while it reads a resistance without one', () => {
    const text = warning([module(AdcError.ADC_ERROR_OK)], {
      ...sensor,
      data: {
        ...sensor.data,
        spec: TempSensorAnalogSpec.SPEC_NOT_SET,
        resistance: bloxQty(108, 'ohm'),
      },
    } as TempSensorAnalogBlock);

    expect(text).toContain(
      'Select a sensor spec to turn the measured resistance into a temperature.',
    );
    expect(text).not.toContain('could not be read');
  });
});
