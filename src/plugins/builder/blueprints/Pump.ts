import {
  DEFAULT_PUMP_PRESSURE,
  LEFT,
  MAX_PUMP_PRESSURE,
  MIN_PUMP_PRESSURE,
  RIGHT,
} from '@/plugins/builder/const';
import { BuilderBlueprint, PersistentPart } from '@/plugins/builder/types';
import { settingsBlock } from '@/plugins/builder/utils';
import { isCompatible } from '@/plugins/spark/utils/info';
import {
  ActuatorPwmBlock,
  BlockType,
  DigitalActuatorBlock,
  DigitalState,
  FastPwmBlock,
} from 'brewblox-proto/ts';

export type PumpT = DigitalActuatorBlock | ActuatorPwmBlock | FastPwmBlock;
export const PUMP_KEY = 'actuator';
export const PWM_PUMP_TYPES = [
  BlockType.ActuatorPwm,
  BlockType.FastPwm,
] as const;
export const PUMP_TYPES = [
  BlockType.DigitalActuator,
  ...PWM_PUMP_TYPES,
] as const;

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
};

export default blueprint;
