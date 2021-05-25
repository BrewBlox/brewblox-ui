import { nanoid } from 'nanoid';

import { BuilderLayout } from '@/plugins/builder/types';

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
          settings: { color: '#c48600' },
          flipped: false,
          type: 'Kettle',
          x: 2,
          y: 1,
        },
        {
          id: nanoid(),
          rotate: 0,
          settings: {
            pwm: {
              serviceId,
              blockId: names.kettlePwm,
            },
            sizeX: 4,
          },
          flipped: false,
          type: 'HeatingElement',
          x: 1,
          y: 6,
        },
        {
          id: nanoid(),
          rotate: 0,
          settings: {
            bordered: false,
            setpoint: {
              serviceId,
              blockId: names.kettleSetpoint,
            },
          },
          flipped: false,
          type: 'SetpointDisplay',
          x: 3,
          y: 3,
        },
        {
          id: nanoid(),
          rotate: 0,
          settings: {
            bordered: false,
            pid: {
              serviceId,
              blockId: names.kettlePid,
            },
          },
          flipped: false,
          type: 'PidDisplay',
          x: 1,
          y: 1,
        },
      ],
    },
  ];
}
