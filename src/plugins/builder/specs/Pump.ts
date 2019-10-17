import get from 'lodash/get';

import { typeName } from '@/plugins/spark/features/DigitalActuator/getters';
import { DigitalActuatorBlock } from '@/plugins/spark/features/DigitalActuator/types';
import { sparkStore } from '@/plugins/spark/store';
import { DigitalState } from '@/plugins/spark/types';

import { DEFAULT_PUMP_PRESSURE, LEFT, MAX_PUMP_PRESSURE, MIN_PUMP_PRESSURE, RIGHT } from '../getters';
import { settingsBlock } from '../helpers';
import { PartSpec, PartUpdater, PersistentPart } from '../types';

const spec: PartSpec = {
  id: 'Pump',
  title: 'Pump',
  size: () => [1, 1],
  cards: [
    {
      component: 'LinkedBlockCard',
      props: { settingsKey: 'actuator', types: [typeName], label: 'Actuator' },
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
    const block = settingsBlock<DigitalActuatorBlock>(part, 'actuator');
    const enabled = !!block
      ? block.data.state === DigitalState.Active
      : part.settings.enabled;

    const pressure = enabled
      ? get(part.settings, 'onPressure', DEFAULT_PUMP_PRESSURE)
      : 0;
    return {
      [LEFT]: [{ outCoords: RIGHT }],
      [RIGHT]: [{ outCoords: LEFT, pressure }],
    };
  },
  interactHandler: (part: PersistentPart, updater: PartUpdater) => {
    const block = settingsBlock(part, 'actuator');
    if (block) {
      block.data.desiredState = block.data.state === DigitalState.Active
        ? DigitalState.Inactive
        : DigitalState.Active;
      sparkStore.saveBlock([block.serviceId, block]);
    } else {
      part.settings.enabled = !part.settings.enabled;
      updater.updatePart(part);
    }
  },
};

export default spec;
