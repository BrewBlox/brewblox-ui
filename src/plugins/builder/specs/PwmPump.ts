import { createDialog } from '@/helpers/dialog';
import { typeName } from '@/plugins/spark/features/ActuatorPwm/getters';
import { ActuatorPwmBlock } from '@/plugins/spark/features/ActuatorPwm/types';
import { sparkStore } from '@/plugins/spark/store';

import { ACCELERATE_OTHERS, DEFAULT_PUMP_PRESSURE, LEFT, RIGHT } from '../getters';
import { settingsBlock } from '../helpers';
import { PartSpec, PersistentPart } from '../types';

const spec: PartSpec = {
  id: 'PwmPump',
  size: () => [1, 1],
  cards: [{
    component: 'LinkedBlockCard',
    props: { settingsKey: 'pwm', types: [typeName], label: 'PWM' },
  }],
  transitions: (part: PersistentPart) => {
    const block = settingsBlock<ActuatorPwmBlock>(part, 'pwm');
    const pressure = block
      ? (block.data.setting / 100) * DEFAULT_PUMP_PRESSURE
      : 0;
    return {
      [LEFT]: [{ outCoords: RIGHT, source: true, pressure: -pressure, liquids: [ACCELERATE_OTHERS] }],
      [RIGHT]: [{ outCoords: LEFT, pressure, source: true, liquids: [ACCELERATE_OTHERS] }],
    };
  },
  interactHandler: (part: PersistentPart) => {
    const block = settingsBlock(part, 'pwm');
    if (block) {
      createDialog({
        component: 'SliderDialog',
        title: 'Pump speed',
        value: block.data.setting,
        label: 'Percentage output',
      })
        .onOk(value => {
          block.data.desiredSetting = value;
          sparkStore.saveBlock([block.serviceId, block]);
        });
    }
  },
};

export default spec;
