import { Dialog } from 'quasar';

import { typeName } from '@/plugins/spark/features/SetpointSensorPair/getters';
import sparkStore from '@/plugins/spark/store';

import { defaultSpec } from '../getters';
import { settingsBlock } from '../helpers';
import { ComponentSpec, StatePart } from '../types';

const SIZE_X = 2;
const SIZE_Y = 1;

const spec: ComponentSpec = {
  ...defaultSpec,
  cards: [{
    component: 'LinkedBlockCard',
    props: { settingsKey: 'setpoint', typeName },
  }],
  size: () => [SIZE_X, SIZE_Y],
  interactHandler: (part: StatePart) => {
    const block = settingsBlock(part, 'setpoint');
    if (block) {
      Dialog.create({
        component: 'UnitDialog',
        title: block.id,
        message: 'Change Setpoint/Sensor Pair',
        value: block.data.storedSetting,
        label: 'Setting',
      })
        .onOk(val => {
          block.data.storedSetting = val;
          sparkStore.saveBlock([block.serviceId, block]);
        });
    }
  },
};

export default spec;
