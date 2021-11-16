import { PartSpec } from '@/plugins/builder/types';
import { universalTransitions } from '@/plugins/builder/utils';
import { useTiltStore } from '@/plugins/tilt/store';

import { SCALE_KEY } from '../const';

export const SIZE_X = 2;
export const SIZE_Y = 1;
export const FLOW_TOGGLE_KEY = 'flowEnabled';
export const TILT_ID_KEY = 'tiltId';

const size: PartSpec['size'] = ({ settings }) => {
  const scale = settings[SCALE_KEY] ?? 1;
  return [SIZE_X * scale, SIZE_Y * scale];
};

const spec: PartSpec = {
  id: 'TiltDisplay',
  title: 'Display: Tilt',
  cards: [
    {
      component: 'SelectCard',
      props: {
        label: 'Tilt',
        settingsKey: TILT_ID_KEY,
        opts: (): SelectOption<string>[] =>
          useTiltStore().values.map((v) => ({ label: v.name, value: v.id })),
        clearable: true,
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
};

export default spec;
