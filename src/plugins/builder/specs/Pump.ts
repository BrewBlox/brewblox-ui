import { createDialog } from '@/helpers/dialog';
import { blockTypes } from '@/plugins/spark/getters';
import { sparkStore } from '@/plugins/spark/store';
import { DigitalState } from '@/plugins/spark/types';

import { DEFAULT_PUMP_PRESSURE, LEFT, MAX_PUMP_PRESSURE, MIN_PUMP_PRESSURE, RIGHT } from '../getters';
import { settingsBlock, showDrivingBlockDialog } from '../helpers';
import { PartSpec, PartUpdater, PersistentPart } from '../types';

const addressKey = 'actuator';

const calcPressure = (part: PersistentPart): number => {
  const block = settingsBlock(part, addressKey);
  if (block === null) {
    return part.settings.enabled
      ? part.settings.onPressure ?? DEFAULT_PUMP_PRESSURE
      : 0;
  }
  if (block.type === 'DigitalActuator') {
    return block.data.state === DigitalState.Active
      ? part.settings.onPressure ?? DEFAULT_PUMP_PRESSURE
      : 0;
  }
  // PWM Actuator
  if (block.type === 'ActuatorPwm') {
    return (block.data.setting / 100) * (part.settings.onPressure ?? DEFAULT_PUMP_PRESSURE);
  }
  return 0;
};

const spec: PartSpec = {
  id: 'Pump',
  title: 'Pump',
  size: () => [1, 1],
  cards: [
    {
      component: 'BlockAddressCard',
      props: {
        settingsKey: addressKey,
        compatible: [blockTypes.DigitalActuator, blockTypes.ActuatorPwm],
        label: 'Actuator',
      },
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
    const pressure = calcPressure(part);
    return {
      [LEFT]: [{ outCoords: RIGHT }],
      [RIGHT]: [{ outCoords: LEFT, pressure }],
    };
  },
  interactHandler: (part: PersistentPart, updater: PartUpdater) => {
    const block = settingsBlock(part, addressKey);
    const driven = block === null
      ? false
      : sparkStore
        .moduleById(block.serviceId)!
        .drivenChains
        .some(v => v[0] === block.id);

    if (block === null) {
      part.settings.enabled = !part.settings.enabled;
      updater.updatePart(part);
    }
    else if (driven) {
      showDrivingBlockDialog(part, addressKey);
    }
    else if (block.type === 'DigitalActuator') {
      block.data.desiredState = block.data.state === DigitalState.Active
        ? DigitalState.Inactive
        : DigitalState.Active;
      sparkStore.saveBlock(block);
    }
    else if (block.type === 'ActuatorPwm') {
      const limiterWarning = block.data.constrainedBy?.constraints.length
        ? 'The value may be limited by constraints'
        : '';
      createDialog({
        component: 'SliderDialog',
        title: 'Pump speed',
        message: limiterWarning,
        value: block.data.desiredSetting,
        label: 'Percentage output',
        quickActions: [
          { label: '0%', value: 0 },
          { label: '50%', value: 50 },
          { label: '100%', value: 100 },
        ],
      })
        .onOk((value: number) => {
          block.data.desiredSetting = value;
          sparkStore.saveBlock(block);
        });
    }
  },
};

export default spec;
