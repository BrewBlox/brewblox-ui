import { nanoid } from 'nanoid';
import {
  BORDER_KEY,
  COLOR_KEY,
  PID_KEY,
  PWM_KEY,
  SETPOINT_KEY,
} from '@/plugins/builder/const';
import { BuilderLayout } from '@/plugins/builder/types';
import { BlockAddress } from '@/plugins/spark/types';
import { typed } from '@/utils/misc';
import { withPrefix } from '../utils';
import { BrewKettleConfig } from './types';

export function defineLayouts(config: BrewKettleConfig): BuilderLayout[] {
  const { serviceId, prefix, names } = config;

  return [
    {
      id: nanoid(),
      title: withPrefix(prefix, 'Layout'),
      width: 7,
      height: 8,
      parts: [
        {
          id: nanoid(),
          rotate: 0,
          settings: {
            [COLOR_KEY]: '#c48600',
          },
          flipped: false,
          type: 'Kettle',
          x: 2,
          y: 1,
          width: 4,
          height: 6,
        },
        {
          id: nanoid(),
          rotate: 0,
          settings: {
            [PWM_KEY]: typed<BlockAddress>({
              serviceId,
              id: names.kettlePwm,
              type: null,
            }),
          },
          flipped: false,
          type: 'HeatingElement',
          x: 1,
          y: 6,
          width: 4,
          height: 1,
        },
        {
          id: nanoid(),
          rotate: 0,
          settings: {
            [BORDER_KEY]: false,
            [SETPOINT_KEY]: typed<BlockAddress>({
              serviceId,
              id: names.kettleSetpoint,
              type: null,
            }),
          },
          flipped: false,
          type: 'SetpointDisplay',
          x: 3,
          y: 3,
          width: 2,
          height: 1,
        },
        {
          id: nanoid(),
          rotate: 0,
          settings: {
            [BORDER_KEY]: false,
            [PID_KEY]: typed<BlockAddress>({
              serviceId,
              id: names.kettlePid,
              type: null,
            }),
          },
          flipped: false,
          type: 'PidDisplay',
          x: 1,
          y: 1,
          width: 1,
          height: 1,
        },
      ],
    },
  ];
}
