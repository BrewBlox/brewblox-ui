import {
  DEFAULT_PUMP_PRESSURE,
  LEFT,
  MAX_PUMP_PRESSURE,
  MIN_PUMP_PRESSURE,
  RIGHT,
} from '@/plugins/builder/const';
import { BuilderBlueprint, PersistentPart } from '@/plugins/builder/types';
import {
  settingsBlock,
  showAbsentBlock,
  showDrivingBlockDialog,
} from '@/plugins/builder/utils';
import { useSparkStore } from '@/plugins/spark/store';
import { isBlockClaimed } from '@/plugins/spark/utils/info';
import { createDialog } from '@/utils/dialog';
import {
  ActuatorPwmBlock,
  BlockType,
  DigitalActuatorBlock,
  DigitalState,
} from 'brewblox-proto/ts';

export type PumpT = DigitalActuatorBlock | ActuatorPwmBlock;
export const PUMP_KEY = 'actuator';
export const PUMP_TYPES = [BlockType.DigitalActuator, BlockType.ActuatorPwm];

const calcPressure = (part: PersistentPart): number => {
  const block = settingsBlock<PumpT>(part, PUMP_KEY, PUMP_TYPES);
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
  if (block.type === BlockType.ActuatorPwm) {
    return (
      (block.data.setting / 100) *
      (part.settings.onPressure ?? DEFAULT_PUMP_PRESSURE)
    );
  }
  return 0;
};

const blueprint: BuilderBlueprint = {
  type: 'Pump',
  title: 'Pump',
  size: () => [1, 1],
  cards: [
    {
      component: 'BlockAddressCard',
      props: {
        settingsKey: PUMP_KEY,
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
  interactHandler: (part: PersistentPart, { savePart }) => {
    const sparkStore = useSparkStore();
    const hasAddr = !!part.settings[PUMP_KEY]?.id;
    const block = settingsBlock<PumpT>(part, PUMP_KEY, PUMP_TYPES);
    const claimed = isBlockClaimed(block, sparkStore.claims);

    if (!hasAddr) {
      part.settings.enabled = !part.settings.enabled;
      savePart(part);
    } else if (block === null) {
      showAbsentBlock(part, PUMP_KEY);
    } else if (claimed) {
      showDrivingBlockDialog(part, PUMP_KEY, PUMP_TYPES);
    } else if (block.type === BlockType.DigitalActuator) {
      sparkStore.patchBlock(block, {
        desiredState:
          block.data.state === DigitalState.STATE_ACTIVE
            ? DigitalState.STATE_INACTIVE
            : DigitalState.STATE_ACTIVE,
      });
    } else if (block.type === BlockType.ActuatorPwm) {
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
      }).onOk((value: number) => {
        sparkStore.patchBlock(block, { desiredSetting: value });
      });
    }
  },
};

export default blueprint;
