import { uid } from 'quasar';

import { BuilderLayout } from '@/plugins/builder/types';

import { withPrefix } from '../helpers';
import { FermentConfig } from './types';

export const defineLayouts = (config: FermentConfig): BuilderLayout[] => {
  const serviceId = config.serviceId;
  return [
    {
      id: uid(),
      title: withPrefix(config.prefix, 'Layout'),
      width: 8,
      height: 10,
      parts: [
        {
          id: uid(),
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
          id: uid(),
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
          id: uid(),
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
          id: uid(),
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
          id: uid(),
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
          id: uid(),
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
          id: uid(),
          type: 'UrlDisplay',
          x: 2,
          y: 1,
          rotate: 0,
          flipped: false,
          settings: {
            bordered: false,
            text: 'User manual',
            url: 'https://brewblox.netlify.app/user/ferment_guide.html',
            sizeX: 4,
            sizeY: 1,
          },
        },
      ],
    },
  ];
};
