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
      height: 9,
      parts: [
        {
          id: uid(),
          type: 'Fridge',
          x: 2,
          y: 1,
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
          y: 3,
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
          type: 'SetpointDisplay',
          x: 2,
          y: 7,
          rotate: 0,
          flipped: false,
          settings: {
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
          y: 7,
          rotate: 0,
          flipped: false,
          settings: {
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
          y: 7,
          rotate: 0,
          flipped: false,
          settings: {
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
          y: 0,
          rotate: 0,
          flipped: false,
          settings: {
            text: 'User manual',
            url: 'https://brewblox.netlify.com/user/ferment_guide.html#ferment-fridge-process-view',
            sizeX: 4,
            sizeY: 1,
          },
        },
      ],
    },
  ];
};
