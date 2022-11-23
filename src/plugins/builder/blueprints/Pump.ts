import {
  DEFAULT_PUMP_PRESSURE,
  LEFT,
  MAX_PUMP_PRESSURE,
  MIN_PUMP_PRESSURE,
  RIGHT,
} from '@/plugins/builder/const';
import { BuilderBlueprint, PersistentPart } from '@/plugins/builder/types';
import {
  scheduleSoftStartRefresh,
  settingsBlock,
  showAbsentBlock,
} from '@/plugins/builder/utils';
import { PWM_SELECT_OPTIONS } from '@/plugins/spark/const';
import { useSparkStore } from '@/plugins/spark/store';
import { isCompatible } from '@/plugins/spark/utils/info';
import { createDialog } from '@/utils/dialog';
import {
  ActuatorPwmBlock,
  BlockType,
  DigitalActuatorBlock,
  DigitalState,
  FastPwmBlock,
} from 'brewblox-proto/ts';

export type PumpT = DigitalActuatorBlock | ActuatorPwmBlock | FastPwmBlock;
export const PUMP_KEY = 'actuator';
export const PWM_PUMP_TYPES = [BlockType.ActuatorPwm, BlockType.FastPwm];
export const PUMP_TYPES = [BlockType.DigitalActuator, ...PWM_PUMP_TYPES];

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
  if (isCompatible(block.type, PWM_PUMP_TYPES)) {
    return (
      (Number(block.data.value) / 100) *
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
        compatible: PUMP_TYPES,
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

    if (!hasAddr) {
      part.settings.enabled = !part.settings.enabled;
      savePart(part);
    } else if (block === null) {
      showAbsentBlock(part, PUMP_KEY);
    } else if (block.type === BlockType.DigitalActuator) {
      const storedState =
        block.data.state === DigitalState.STATE_INACTIVE
          ? DigitalState.STATE_ACTIVE
          : DigitalState.STATE_INACTIVE;
      sparkStore.patchBlock(block, { storedState });
      scheduleSoftStartRefresh(block);
    } else if (isCompatible(block.type, PWM_PUMP_TYPES)) {
      const limiterWarning = block.data.constrainedBy?.constraints.length
        ? 'The value may be limited by constraints'
        : '';
      createDialog({
        component: 'SliderDialog',
        componentProps: {
          modelValue: block.data.storedSetting,
          title: 'Pump speed',
          message: limiterWarning,
          label: 'Percentage output',
          quickActions: PWM_SELECT_OPTIONS,
        },
      }).onOk((storedSetting: number) =>
        sparkStore.patchBlock(block, { storedSetting }),
      );
    }
  },
};

export default blueprint;
