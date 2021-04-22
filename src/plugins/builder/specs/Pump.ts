import { DEFAULT_PUMP_PRESSURE, LEFT, MAX_PUMP_PRESSURE, MIN_PUMP_PRESSURE, RIGHT } from '@/plugins/builder/getters';
import { PartSpec, PartUpdater, PersistentPart } from '@/plugins/builder/types';
import { settingsBlock, showAbsentBlock, showDrivingBlockDialog } from '@/plugins/builder/utils';
import { sparkStore } from '@/plugins/spark/store';
import { ActuatorPwmBlock, BlockType, DigitalActuatorBlock, DigitalState } from '@/plugins/spark/types';
import { isBlockDriven } from '@/plugins/spark/utils';
import { createDialog } from '@/utils/dialog';

type BlockT = DigitalActuatorBlock | ActuatorPwmBlock;
const addressKey = 'actuator';


const calcPressure = (part: PersistentPart): number => {
  const block = settingsBlock<BlockT>(part, addressKey);
  if (block === null) {
    return part.settings.enabled
      ? part.settings.onPressure ?? DEFAULT_PUMP_PRESSURE
      : 0;
  }
  if (block.type === BlockType.DigitalActuator) {
    return block.data.state === DigitalState.STATE_ACTIVE
      ? part.settings.onPressure ?? DEFAULT_PUMP_PRESSURE
      : 0;
  }
  // PWM Actuator
  if (block.type === BlockType.ActuatorPwm) {
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
        compatible: [BlockType.DigitalActuator, BlockType.ActuatorPwm],
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
    const hasAddr = !!part.settings[addressKey]?.id;
    const block = settingsBlock<BlockT>(part, addressKey);
    const driven = isBlockDriven(block);

    if (!hasAddr) {
      part.settings.enabled = !part.settings.enabled;
      updater.updatePart(part);
    }
    else if (block === null) {
      showAbsentBlock(part, addressKey);
    }
    else if (driven) {
      showDrivingBlockDialog(part, addressKey);
    }
    else if (block.type === BlockType.DigitalActuator) {
      block.data.desiredState =
        block.data.state === DigitalState.STATE_ACTIVE
          ? DigitalState.STATE_INACTIVE
          : DigitalState.STATE_ACTIVE;
      sparkStore.saveBlock(block);
    }
    else if (block.type === BlockType.ActuatorPwm) {
      const limiterWarning = block.data.constrainedBy?.constraints.length
        ? 'The value may be limited by constraints'
        : '';
      createDialog({
        component: 'SliderDialog',
        componentProps: {
          modelValue: block.data.desiredSetting,
          title: 'Pump speed',
          message: limiterWarning,
          label: 'Percentage output',
          quickActions: [
            { label: '0%', value: 0 },
            { label: '50%', value: 50 },
            { label: '100%', value: 100 },
          ],
        },
      })
        .onOk((value: number) => {
          block.data.desiredSetting = value;
          sparkStore.saveBlock(block);
        });
    }
  },
};

export default spec;
