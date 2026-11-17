import { flushPromises } from '@vue/test-utils';
import { BlockType, Spark3PinsBlock } from 'brewblox-proto/ts';
import { describe, expect, it, vi } from 'vitest';
import { useSparkStore } from '@/plugins/spark/store';
import { createDialogPromise } from '@/utils/dialog';
import { mountBlockWidget } from '../../../../../../test/block-widget';
import Spark3PinsWidget from '../Spark3PinsWidget.vue';

vi.mock('@/utils/dialog', () => ({
  createDialogPromise: vi.fn(),
}));

const pins: Spark3PinsBlock = {
  id: 'SparkPins',
  serviceId: 'sparkey',
  type: BlockType.Spark3Pins,
  data: {
    channels: [],
    enableIoSupply12V: false,
    soundAlarm: false,
    voltage5: 5,
    voltage12: 0,
    powerCycleIoSupply5V: false,
  },
};

async function clickPowerCycle(confirmed: boolean): Promise<unknown[][]> {
  vi.mocked(createDialogPromise).mockResolvedValue(confirmed || undefined);
  const wrapper = mountBlockWidget(Spark3PinsWidget, pins, {
    stubs: {
      BlockWidgetToolbar: true,
      Card: true,
      IoArray: true,
      LabeledField: true,
    },
  });
  const patchBlock = vi
    .spyOn(useSparkStore(), 'patchBlock')
    .mockResolvedValue(null);
  const button = wrapper
    .findAll('button')
    .find((b) => b.text().includes('Power-cycle 5V'));
  await button!.trigger('click');
  await flushPromises();
  return patchBlock.mock.calls;
}

describe('Spark3PinsWidget', () => {
  it('power-cycles 5V with one write of the trigger', async () => {
    const calls = await clickPowerCycle(true);

    expect(calls).toHaveLength(1);
    expect(calls[0][1]).toEqual({ powerCycleIoSupply5V: true });
  });

  it('writes nothing when the power cycle is not confirmed', async () => {
    expect(await clickPowerCycle(false)).toHaveLength(0);
  });
});
