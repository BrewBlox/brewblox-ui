import { BlockIntfType, BlockType, PidBlock } from 'brewblox-proto/ts';
import { describe, expect, it } from 'vitest';
import { bloxLink } from '@/utils/link';
import {
  bloxQty,
  deltaTempQty,
  inverseTempQty,
  tempQty,
} from '@/utils/quantity';
import { mountBlockWidget } from '../../../../../../test/block-widget';
import PidFull from '../PidFull.vue';

const pid: PidBlock = {
  id: 'PID',
  serviceId: 'sparkey',
  type: BlockType.Pid,
  data: {
    inputId: bloxLink(null, BlockIntfType.SetpointSensorPairInterface),
    outputId: bloxLink(null, BlockIntfType.ActuatorAnalogInterface),
    ambientId: bloxLink(null, BlockIntfType.TempSensorInterface),
    inputValue: tempQty(20),
    inputSetting: tempQty(20),
    outputValue: 0,
    outputSetting: 0,
    enabled: true,
    active: true,
    kp: inverseTempQty(20),
    ti: bloxQty('2h'),
    td: bloxQty('100s'),
    kff: inverseTempQty(0),
    p: 1,
    i: 0,
    d: 2,
    ff: 0,
    error: deltaTempQty(0.1),
    integral: 0,
    derivative: 0.02,
    integralReset: 0,
    boilPointAdjust: deltaTempQty(0),
    boilMinOutput: 0,
    boilModeActive: false,
    ambientValue: tempQty(null),
    ambientOffset: deltaTempQty(0),
    smoothBand: deltaTempQty(0.25),
    smoothGain: 0.5,
  },
};

describe('PidFull', () => {
  // The firmware's derivative already carries the smooth gain: D = derivative x Td
  it('applies the smooth gain to P alone', () => {
    const labels = mountBlockWidget(PidFull, pid, {})
      .findAll('[label]')
      .map((el) => el.attributes('label'));

    expect(labels.filter((label) => label === 'Smoothing')).toHaveLength(1);
  });

  it('shows a held FF dimmed while the ambient is gone', () => {
    const wrapper = mountBlockWidget(
      PidFull,
      {
        ...pid,
        data: {
          ...pid.data,
          ambientId: bloxLink('Room', BlockIntfType.TempSensorInterface),
          // Ti 2h: I without FF is integral / 7200 = 1
          integral: 7200,
          i: 3,
          ff: null,
        },
      },
      {},
    );
    const held = wrapper
      .findAll('span.fade-4')
      .find((s) => s.text() === '2.00');

    expect(held).toBeDefined();
    expect(wrapper.text()).toContain('incl. held FF');
  });

  it('shows no held FF while the ambient gives FF', () => {
    const text = mountBlockWidget(
      PidFull,
      {
        ...pid,
        data: {
          ...pid.data,
          ambientId: bloxLink('Room', BlockIntfType.TempSensorInterface),
          integral: 7200,
          i: 1,
          ff: 2,
        },
      },
      {},
    ).text();

    expect(text).not.toContain('incl. held FF');
  });

  it('keeps a held FF shown after the ambient link is cleared', () => {
    const text = mountBlockWidget(
      PidFull,
      { ...pid, data: { ...pid.data, integral: 7200, i: 3, ff: null } },
      {},
    ).text();

    expect(text).toContain('incl. held FF');
  });

  it('marks D while the Spark limits it', () => {
    // Td 100 s x a derivative of 0.05 is 5, which the Spark limited to 2
    const limited = { ...pid, data: { ...pid.data, derivative: 0.05, d: 2 } };
    const free = { ...pid, data: { ...pid.data, derivative: 0.02, d: 2 } };

    expect(mountBlockWidget(PidFull, limited, {}).text()).toContain('limited');
    expect(mountBlockWidget(PidFull, free, {}).text()).not.toContain('limited');
  });
});
