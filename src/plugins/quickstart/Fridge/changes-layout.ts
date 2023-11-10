import { nanoid } from 'nanoid';
import { SHELF_Y_KEY } from '@/plugins/builder/blueprints/Fridge';
import {
  BORDER_KEY,
  LABEL_KEY,
  PID_KEY,
  SETPOINT_KEY,
} from '@/plugins/builder/const';
import { BuilderLayout } from '@/plugins/builder/types';
import { BlockAddress } from '@/plugins/spark/types';
import { typed } from '@/utils/misc';
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
            [SHELF_Y_KEY]: 4,
            [LABEL_KEY]: 'Fridge',
          },
          width: 4,
          height: 7,
        },
        {
          id: nanoid(),
          type: 'BeerBottle',
          x: 3,
          y: 3,
          rotate: 0,
          flipped: false,
          settings: {},
          width: 1,
          height: 2,
        },
        {
          id: nanoid(),
          type: 'BeerBottle',
          x: 4,
          y: 3,
          rotate: 0,
          flipped: false,
          settings: {},
          width: 1,
          height: 2,
        },
        {
          id: nanoid(),
          type: 'BeerBottle',
          x: 3,
          y: 5,
          rotate: 0,
          flipped: false,
          settings: {},
          width: 1,
          height: 2,
        },
        {
          id: nanoid(),
          type: 'BeerBottle',
          x: 4,
          y: 5,
          rotate: 0,
          flipped: false,
          settings: {},
          width: 1,
          height: 2,
        },
        {
          id: nanoid(),
          type: 'BeerBottle',
          x: 5,
          y: 5,
          rotate: 0,
          flipped: false,
          settings: {},
          width: 1,
          height: 2,
        },
        {
          id: nanoid(),
          type: 'SetpointDisplay',
          x: 2,
          y: 7,
          rotate: 0,
          flipped: false,
          settings: {
            [BORDER_KEY]: false,
            [SETPOINT_KEY]: typed<BlockAddress>({
              serviceId,
              id: names.fridgeSetpoint,
              type: null,
            }),
          },
          width: 2,
          height: 1,
        },
        {
          id: nanoid(),
          type: 'PidDisplay',
          x: 4,
          y: 7,
          rotate: 0,
          flipped: false,
          settings: {
            [BORDER_KEY]: false,
            [PID_KEY]: typed<BlockAddress>({
              serviceId,
              id: names.coolPid,
              type: null,
            }),
          },
          width: 1,
          height: 1,
        },
        {
          id: nanoid(),
          type: 'PidDisplay',
          x: 5,
          y: 7,
          rotate: 0,
          flipped: false,
          settings: {
            [BORDER_KEY]: false,
            [PID_KEY]: typed<BlockAddress>({
              serviceId,
              id: names.heatPid,
              type: null,
            }),
          },
          width: 1,
          height: 1,
        },
      ],
    },
  ];
};
