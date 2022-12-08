import {
  BORDER_KEY,
  COLOR_KEY,
  LABEL_KEY,
  PID_KEY,
  PROFILE_KEY,
  SETPOINT_KEY,
  SIZE_X_KEY,
  SIZE_Y_KEY,
  URL_KEY,
} from '@/plugins/builder/const';
import { BuilderLayout } from '@/plugins/builder/types';
import { BlockAddress } from '@/plugins/spark/types';
import { typed } from '@/utils/misc';
import { BlockIntfType, BlockType } from 'brewblox-proto/ts';
import { nanoid } from 'nanoid';
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
            [SIZE_Y_KEY]: 7,
            [LABEL_KEY]: withPrefix(config.prefix, 'fridge'),
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
            [COLOR_KEY]: 'E1AC00',
            [SETPOINT_KEY]: typed<BlockAddress>({
              serviceId,
              id: config.names.beerSetpoint,
              type: BlockIntfType.SetpointSensorPairInterface,
            }),
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
            [BORDER_KEY]: false,
            [PROFILE_KEY]: typed<BlockAddress>({
              serviceId,
              id: config.names.tempProfile,
              type: BlockType.SetpointProfile,
            }),
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
            [BORDER_KEY]: false,
            [SETPOINT_KEY]: typed<BlockAddress>({
              serviceId,
              id: config.names.fridgeSetpoint,
              type: BlockIntfType.SetpointSensorPairInterface,
            }),
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
            [BORDER_KEY]: false,
            [PID_KEY]: typed<BlockAddress>({
              serviceId,
              id: config.names.coolPid,
              type: BlockType.Pid,
            }),
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
            [BORDER_KEY]: false,
            [PID_KEY]: typed<BlockAddress>({
              serviceId,
              id: config.names.heatPid,
              type: BlockType.Pid,
            }),
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
            [BORDER_KEY]: false,
            [LABEL_KEY]: 'User manual',
            [URL_KEY]: 'https://www.brewblox.com/user/ferment_guide.html',
            [SIZE_X_KEY]: 4,
            [SIZE_Y_KEY]: 1,
          },
        },
      ],
    },
  ];
};
