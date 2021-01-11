import { uid } from 'quasar';

import { BuilderLayout } from '@/plugins/builder/types';

import { withPrefix } from '../helpers';
import { FridgeConfig } from './types';

export const defineLayouts = (config: FridgeConfig): BuilderLayout[] => {
  const { serviceId, names } = config;
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
            text: 'Fridge',
            shelfY: 4,
          },
        },
        {
          id: uid(),
          type: 'BeerBottle',
          x: 3,
          y: 3,
          rotate: 0,
          flipped: false,
          settings: {},
        },
        {
          id: uid(),
          type: 'BeerBottle',
          x: 4,
          y: 3,
          rotate: 0,
          flipped: false,
          settings: {},
        },
        {
          id: uid(),
          type: 'BeerBottle',
          x: 3,
          y: 5,
          rotate: 0,
          flipped: false,
          settings: {},
        },
        {
          id: uid(),
          type: 'BeerBottle',
          x: 4,
          y: 5,
          rotate: 0,
          flipped: false,
          settings: {},
        },
        {
          id: uid(),
          type: 'BeerBottle',
          x: 5,
          y: 5,
          rotate: 0,
          flipped: false,
          settings: {},
        },
        {
          id: uid(),
          type: 'SetpointDisplay',
          x: 2,
          y: 7,
          rotate: 0,
          flipped: false,
          settings: {
            bordered: false,
            setpoint: {
              serviceId,
              blockId: names.fridgeSetpoint,
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
            bordered: false,
            pid: {
              serviceId,
              blockId: names.coolPid,
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
            bordered: false,
            pid: {
              serviceId,
              blockId: names.heatPid,
            },
          },
        },
      ],
    },
  ];
};
