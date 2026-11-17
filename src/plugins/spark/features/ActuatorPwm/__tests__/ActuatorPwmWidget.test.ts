import { VueWrapper } from '@vue/test-utils';
import {
  ActuatorPwmBlock,
  Block,
  BlockIntfType,
  BlockType,
  SettingMode,
} from 'brewblox-proto/ts';
import { describe, expect, it } from 'vitest';
import { bloxLink } from '@/utils/link';
import { bloxQty } from '@/utils/quantity';
import {
  mountBlockWidget,
  slotStub,
} from '../../../../../../test/block-widget';
import ActuatorPwmWidget from '../ActuatorPwmWidget.vue';

const pwm = (setting: number | null): ActuatorPwmBlock => ({
  id: 'Heater PWM',
  serviceId: 'sparkey',
  type: BlockType.ActuatorPwm,
  data: {
    enabled: true,
    actuatorId: bloxLink('Heater', BlockIntfType.ActuatorDigitalInterface),
    storedSetting: 50,
    desiredSetting: 50,
    setting,
    value: setting,
    period: bloxQty('4s'),
    constraints: {},
    claimedBy: bloxLink(null),
    settingMode: SettingMode.STORED,
  },
});

const actuator = (holder: string): Block =>
  ({
    id: 'Heater',
    serviceId: 'sparkey',
    type: BlockType.DigitalActuator,
    data: { claimedBy: bloxLink(holder) },
  }) as unknown as Block;

const mount = (block: ActuatorPwmBlock, others: Block[]): VueWrapper =>
  mountBlockWidget(ActuatorPwmWidget, block, {
    others,
    mode: 'Basic',
    stubs: {
      BlockEnableToggle: true,
      BlockHistoryGraph: true,
      BlockWidgetToolbar: true,
      CardWarning: slotStub('message'),
      PreviewCard: true,
    },
  });

describe('ActuatorPwmWidget', () => {
  it('names a target that is gone', () => {
    expect(mount(pwm(null), []).text()).toContain(
      'PWM drives nothing: its target Heater is gone.',
    );
  });

  it('names the block that holds its target', () => {
    expect(mount(pwm(null), [actuator('Other PWM')]).text()).toContain(
      'PWM drives nothing: its target Heater is held by Other PWM.',
    );
  });

  it('warns of nothing while it delivers', () => {
    expect(mount(pwm(50), [actuator('Heater PWM')]).text()).not.toContain(
      'drives nothing',
    );
  });

  it('shows no limit without a setting', () => {
    const limited = mount(pwm(null), [])
      .findAll('div')
      .find((d) => d.text().startsWith('Limited:'));

    expect(limited?.classes()).toContain('fade-4');
  });
});
