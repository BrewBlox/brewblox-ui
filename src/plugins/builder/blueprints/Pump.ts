import {
  DEFAULT_PUMP_PRESSURE,
  DigitalBlockT,
  DIGITAL_TYPES,
  IO_ENABLED_KEY,
  IO_PRESSURE_KEY,
  LEFT,
  MAX_PUMP_PRESSURE,
  MIN_PUMP_PRESSURE,
  PumpBlockT,
  PUMP_KEY,
  PUMP_TYPES,
  PwmBlockT,
  PWM_TYPES,
  RIGHT,
} from '@/plugins/builder/const';
import { BuilderBlueprint, PersistentPart } from '@/plugins/builder/types';
import { settingsBlock } from '@/plugins/builder/utils';
import { isBlockCompatible } from '@/plugins/spark/utils/info';
import { DigitalState } from 'brewblox-proto/ts';

export type OnInteractBehavior = 'toggle' | 'dialog';

export const ON_INTERACT_KEY = 'onInteract';

const calcPressure = (part: PersistentPart): number => {
  const block = settingsBlock<PumpBlockT>(part, PUMP_KEY, PUMP_TYPES);
  if (block == null) {
    return part.settings[IO_ENABLED_KEY]
      ? Number(part.settings[IO_PRESSURE_KEY] ?? DEFAULT_PUMP_PRESSURE)
      : 0;
  }
  if (isBlockCompatible<DigitalBlockT>(block, DIGITAL_TYPES)) {
    return block.data.state === DigitalState.STATE_ACTIVE
      ? Number(part.settings[IO_PRESSURE_KEY] ?? DEFAULT_PUMP_PRESSURE)
      : 0;
  }
  if (isBlockCompatible<PwmBlockT>(block, PWM_TYPES)) {
    return (
      (Number(block.data.value) / 100) *
      (part.settings[IO_PRESSURE_KEY] ?? DEFAULT_PUMP_PRESSURE)
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
        settingsKey: IO_PRESSURE_KEY,
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
