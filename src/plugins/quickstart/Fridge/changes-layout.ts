import { nanoid } from 'nanoid';

import { BuilderLayout } from '@/plugins/builder/types';

import { withPrefix } from '../utils';
import { FridgeConfig } from './types';

export const defineLayouts = (config: FridgeConfig): BuilderLayout[] => {
  const { serviceId, names } = config;
  return [
    {
      id: nanoid(),
      title: withPrefix(config.prefix, 'Layout'),
      width: 8,
      height: 9,
      parts: [
        {
          id: nanoid(),
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
          id: nanoid(),
          type: 'BeerBottle',
          x: 3,
          y: 3,
          rotate: 0,
          flipped: false,
          settings: {},
        },
        {
          id: nanoid(),
          type: 'BeerBottle',
          x: 4,
          y: 3,
          rotate: 0,
          flipped: false,
          settings: {},
        },
        {
          id: nanoid(),
          type: 'BeerBottle',
          x: 3,
          y: 5,
          rotate: 0,
          flipped: false,
          settings: {},
        },
        {
          id: nanoid(),
          type: 'BeerBottle',
          x: 4,
          y: 5,
          rotate: 0,
          flipped: false,
          settings: {},
        },
        {
          id: nanoid(),
          type: 'BeerBottle',
          x: 5,
          y: 5,
          rotate: 0,
          flipped: false,
          settings: {},
        },
        {
          id: nanoid(),
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
          id: nanoid(),
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
          id: nanoid(),
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
