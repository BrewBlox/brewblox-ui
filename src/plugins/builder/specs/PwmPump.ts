import { createDialog } from '@/helpers/dialog';
import { typeName } from '@/plugins/spark/features/ActuatorPwm/getters';
import { ActuatorPwmBlock } from '@/plugins/spark/features/ActuatorPwm/types';
import { sparkStore } from '@/plugins/spark/store';

import { DEFAULT_PUMP_PRESSURE, LEFT, MAX_PUMP_PRESSURE, MIN_PUMP_PRESSURE, RIGHT } from '../getters';
import { settingsBlock } from '../helpers';
import { PartSpec, PersistentPart } from '../types';

const spec: PartSpec = {
  id: 'PwmPump',
  title: 'Pump: PWM',
  size: () => [1, 1],
  cards: [
    {
      component: 'LinkedBlockCard',
      props: { settingsKey: 'pwm', types: [typeName], label: 'PWM' },
    },
    {
      component: 'PressureCard',
      props: {
        settingsKey: 'onPressure',
        min: MIN_PUMP_PRESSURE,
        max: MAX_PUMP_PRESSURE,
        defaultValue: DEFAULT_PUMP_PRESSURE,
      },
    },
  ],
  transitions: (part: PersistentPart) => {
    const block = settingsBlock<ActuatorPwmBlock>(part, 'pwm');
    const pressure = block
      ? (block.data.setting / 100) * (part.settings.onPressure || DEFAULT_PUMP_PRESSURE)
      : 0;
    return {
      [LEFT]: [{ outCoords: RIGHT, source: true }],
      [RIGHT]: [{ outCoords: LEFT, pressure, source: true }],
    };
  },
  interactHandler: (part: PersistentPart) => {
    const block = settingsBlock<ActuatorPwmBlock>(part, 'pwm');
    if (block) {
      const limiterWarning = block.data.constrainedBy?.constraints.length
        ? 'The value may be limited by constraints'
        : '';
      createDialog({
        component: 'SliderDialog',
        title: 'Pump speed',
        message: limiterWarning,
        value: block.data.setting,
        label: 'Percentage output',
        quickActions: [
          { label: '0%', value: 0 },
          { label: '50%', value: 50 },
          { label: '100%', value: 100 },
        ],
      })
        .onOk(value => {
          block.data.desiredSetting = value;
          sparkStore.saveBlock([block.serviceId, block]);
        });
    }
  },
};

export default spec;
