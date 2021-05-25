import { nanoid } from 'nanoid';

import { BuilderLayout } from '@/plugins/builder/types';

import { withPrefix } from '../utils';
import { FermentConfig } from './types';

export const defineLayouts = (config: FermentConfig): BuilderLayout[] => {
  const serviceId = config.serviceId;
  return [
    {
      id: nanoid(),
      title: withPrefix(config.prefix, 'Layout'),
      width: 8,
      height: 10,
      parts: [
        {
          id: nanoid(),
          type: 'Fridge',
          x: 2,
          y: 2,
          rotate: 0,
          flipped: false,
          settings: {
            sizeY: 7,
            text: withPrefix(config.prefix, 'fridge'),
          },
        },
        {
          id: nanoid(),
          type: 'Carboy',
          x: 3,
          y: 4,
          rotate: 0,
          flipped: false,
          settings: {
            color: 'E1AC00',
            setpoint: {
              serviceId,
              blockId: config.names.beerSetpoint,
            },
          },
        },
        {
          id: nanoid(),
          type: 'ProfileDisplay',
          x: 3,
          y: 3,
          rotate: 0,
          flipped: false,
          settings: {
            bordered: false,
            profile: {
              serviceId,
              blockId: config.names.tempProfile,
            },
          },
        },
        {
          id: nanoid(),
          type: 'SetpointDisplay',
          x: 2,
          y: 8,
          rotate: 0,
          flipped: false,
          settings: {
            bordered: false,
            setpoint: {
              serviceId,
              blockId: config.names.fridgeSetpoint,
            },
          },
        },
        {
          id: nanoid(),
          type: 'PidDisplay',
          x: 4,
          y: 8,
          rotate: 0,
          flipped: false,
          settings: {
            bordered: false,
            pid: {
              serviceId,
              blockId: config.names.coolPid,
            },
          },
        },
        {
          id: nanoid(),
          type: 'PidDisplay',
          x: 5,
          y: 8,
          rotate: 0,
          flipped: false,
          settings: {
            bordered: false,
            pid: {
              serviceId,
              blockId: config.names.heatPid,
            },
          },
        },
        {
          id: nanoid(),
          type: 'UrlDisplay',
          x: 2,
          y: 1,
          rotate: 0,
          flipped: false,
          settings: {
            bordered: false,
            text: 'User manual',
            url: 'https://brewblox.netlify.app/user/ferment_gnanoide.html',
            sizeX: 4,
            sizeY: 1,
          },
        },
      ],
    },
  ];
};
