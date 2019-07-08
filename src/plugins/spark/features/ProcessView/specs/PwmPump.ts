import { Dialog } from 'quasar';

import { typeName } from '@/plugins/spark/features/ActuatorPwm/getters';
import sparkStore from '@/plugins/spark/store';

import { ActuatorPwmBlock } from '../../ActuatorPwm/types';
import { ACCELERATE_OTHERS, DEFAULT_PUMP_PRESSURE, LEFT, RIGHT, defaultSpec } from '../getters';
import { settingsBlock } from '../helpers';
import { ComponentSpec, StatePart } from '../types';

const spec: ComponentSpec = {
  ...defaultSpec,
  cards: [{
    component: 'LinkedBlockCard',
    props: { settingsKey: 'pwm', typeName },
  }],
  transitions: (part: StatePart) => {
    const block = settingsBlock<ActuatorPwmBlock>(part, 'pwm');
    const pressure = block
      ? (block.data.setting / 100) * DEFAULT_PUMP_PRESSURE
      : 0;
    return {
      [LEFT]: [{ outCoords: RIGHT }],
      [RIGHT]: [{ outCoords: LEFT, pressure, liquids: [ACCELERATE_OTHERS] }],
    };
  },
  interactHandler: (part: StatePart) => {
    const block = settingsBlock(part, 'pwm');
    if (block) {
      Dialog.create({
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
