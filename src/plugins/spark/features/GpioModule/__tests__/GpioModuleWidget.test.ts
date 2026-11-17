import {
  AdcError,
  AnalogModuleChannel,
  AnalogSensorType,
  BlockType,
  GpioErrorFlags,
  GpioModuleBlock,
  GpioPins,
} from 'brewblox-proto/ts';
import { describe, expect, it } from 'vitest';
import {
  mountBlockWidget,
  slotStub,
} from '../../../../../../test/block-widget';
import GpioModuleWidget from '../GpioModuleWidget.vue';

const channel = (id: number, error?: AdcError): AnalogModuleChannel =>
  ({
    id,
    sensorType: AnalogSensorType.ANALOG_SENSOR_TYPE_RTD_3WIRE,
    ...(error && { error }),
  }) as AnalogModuleChannel;

const module = (analogChannels: AnalogModuleChannel[]): GpioModuleBlock => ({
  id: 'GPIO',
  serviceId: 'sparkey',
  type: BlockType.GpioModule,
  data: {
    channels: [],
    modulePosition: 1,
    useExternalPower: false,
    status: {
      moduleStatus: GpioErrorFlags.NONE,
      pullUpDesired: GpioPins.NONE,
      pullUpStatus: GpioPins.NONE,
      pullUpWhenActive: GpioPins.NONE,
      pullUpWhenInactive: GpioPins.NONE,
      pullDownDesired: GpioPins.NONE,
      pullDownStatus: GpioPins.NONE,
      pullDownWhenActive: GpioPins.NONE,
      pullDownWhenInactive: GpioPins.NONE,
      overCurrent: GpioPins.NONE,
      openLoad: GpioPins.NONE,
      faultsHistory5m: GpioErrorFlags.NONE,
      faultsHistory60m: GpioErrorFlags.NONE,
    },
    analogChannels,
    calibrateAnalog: false,
  },
});

const warning = (analogChannels: AnalogModuleChannel[]): string =>
  mountBlockWidget(GpioModuleWidget, module(analogChannels), {
    mode: 'Basic',
    stubs: {
      AnalogArrayEditor: true,
      BlockWidgetToolbar: true,
      Card: true,
      CardWarning: slotStub('message'),
      GpioArrayEditor: true,
    },
  }).text();

describe('GpioModuleWidget', () => {
  it('warns of the ADC pair that stopped', () => {
    const timeout = AdcError.ADC_ERROR_DATA_READY_TIMEOUT;
    const text = warning([
      channel(1, timeout),
      channel(2, timeout),
      channel(3, AdcError.ADC_ERROR_OK),
      channel(4, AdcError.ADC_ERROR_OK),
    ]);

    expect(text).toContain(
      'ERROR: ADC of channels A1, A2 stopped: No data in time',
    );
    expect(text).not.toContain('B1, B2');
  });

  it('warns of no ADC while both pairs run', () => {
    const ok = AdcError.ADC_ERROR_OK;
    expect(warning([channel(1, ok), channel(3, ok)])).not.toContain('ADC');
  });

  it('warns of no ADC when the firmware sends no error', () => {
    expect(warning([channel(1), channel(3)])).not.toContain('ADC');
  });
});
