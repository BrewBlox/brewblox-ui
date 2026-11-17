import {
  Block,
  BlockIntfType,
  BlockType,
  ChannelCapabilities,
  FastPwmBlock,
  PwmFrequency,
  SettingMode,
  TransitionDurationPreset,
} from 'brewblox-proto/ts';
import { describe, expect, it } from 'vitest';
import { bloxLink } from '@/utils/link';
import { bloxQty } from '@/utils/quantity';
import {
  mountBlockWidget,
  slotStub,
} from '../../../../../../test/block-widget';
import FastPwmWidget from '../FastPwmWidget.vue';

const pwm = (setting: number | null): FastPwmBlock => ({
  id: 'Fast PWM',
  serviceId: 'sparkey',
  type: BlockType.FastPwm,
  data: {
    enabled: true,
    hwDevice: bloxLink('Pins', BlockIntfType.IoArrayInterface),
    channel: 1,
    storedSetting: 50,
    desiredSetting: 50,
    setting,
    value: setting,
    invert: false,
    frequency: PwmFrequency.PWM_FREQ_100HZ,
    constraints: {},
    transitionDurationPreset: TransitionDurationPreset.ST_OFF,
    transitionDurationSetting: bloxQty('0s'),
    transitionDurationValue: bloxQty('0s'),
    claimedBy: bloxLink(null),
    settingMode: SettingMode.STORED,
  },
});

const pins = (holder: string | null): Block =>
  ({
    id: 'Pins',
    serviceId: 'sparkey',
    type: BlockType.Spark3Pins,
    data: {
      channels: [
        {
          id: 1,
          capabilities: ChannelCapabilities.CHAN_SUPPORTS_PWM_100HZ,
          claimedBy: bloxLink(holder),
        },
      ],
    },
  }) as unknown as Block;

const text = (block: FastPwmBlock, others: Block[]): string =>
  mountBlockWidget(FastPwmWidget, block, {
    others,
    mode: 'Basic',
    stubs: {
      BlockEnableToggle: true,
      BlockHistoryGraph: true,
      BlockWidgetToolbar: true,
      CardWarning: slotStub('message'),
      PreviewCard: true,
    },
  }).text();

describe('FastPwmWidget', () => {
  it('names the block that holds its channel', () => {
    expect(text(pwm(null), [pins('Other PWM')])).toMatch(
      /PWM drives nothing: .+ on Pins is held by Other PWM\./,
    );
  });

  it('says the channel answers an error when no block holds it', () => {
    expect(text(pwm(null), [pins('Fast PWM')])).toMatch(
      /PWM drives nothing: .+ on Pins answers an error\./,
    );
  });

  it('warns of nothing while it delivers', () => {
    expect(text(pwm(50), [pins('Fast PWM')])).not.toContain('drives nothing');
  });

  it('names a device that is gone', () => {
    expect(text(pwm(null), [])).toContain("PWM's device Pins is gone.");
  });

  it('names a channel without PWM support', () => {
    const digital = {
      ...pins('Fast PWM'),
      data: {
        channels: [
          {
            id: 1,
            capabilities: ChannelCapabilities.CHAN_SUPPORTS_DIGITAL_OUTPUT,
            claimedBy: bloxLink('Fast PWM'),
          },
        ],
      },
    } as unknown as Block;
    expect(text(pwm(null), [digital])).toMatch(
      /PWM drives nothing: .+ on Pins does not support PWM\./,
    );
  });

  it('names a channel the device does not have', () => {
    const fewer = {
      ...pins('Fast PWM'),
      data: { channels: [] },
    } as unknown as Block;
    expect(text(pwm(null), [fewer])).toContain(
      'PWM drives nothing: Pins has no channel 1.',
    );
  });
});
