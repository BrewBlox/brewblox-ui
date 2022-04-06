import { SCALE_KEY } from '@/plugins/builder/const';
import { BuilderBlueprint } from '@/plugins/builder/types';
import {
  showSettingsBlock,
  universalTransitions,
} from '@/plugins/builder/utils';
import { BlockType } from '@/plugins/spark/types';

export const SIZE_X = 1;
export const SIZE_Y = 1;
export const PID_KEY = 'pid';
export const PID_TYPES = [BlockType.Pid];
export const FLOW_TOGGLE_KEY = 'flowEnabled';

const size: BuilderBlueprint['size'] = ({ settings }) => {
  const scale = settings[SCALE_KEY] ?? 1;
  return [SIZE_X * scale, SIZE_Y * scale];
};

const blueprint: BuilderBlueprint = {
  type: 'PidDisplay',
  title: 'Display: PID',
  cards: [
    {
      component: 'BlockAddressCard',
      props: {
        settingsKey: PID_KEY,
        compatible: PID_TYPES,
        label: 'PID',
      },
    },
    {
      component: 'ScaleCard',
      props: {
        settingsKey: SCALE_KEY,
        defaultSize: [SIZE_X, SIZE_Y],
      },
    },
    {
      component: 'ToggleCard',
      props: {
        settingsKey: FLOW_TOGGLE_KEY,
        label: 'Allow liquid to flow through this part',
      },
    },
    {
      component: 'BorderCard',
    },
  ],
  size,
  transitions: (part) =>
    universalTransitions(size(part), part.settings[FLOW_TOGGLE_KEY]),
  interactHandler: (part) => showSettingsBlock(part, PID_KEY, PID_TYPES),
};

export default blueprint;
