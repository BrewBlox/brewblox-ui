import { nanoid } from 'nanoid';
import { KETTLE_FILL_PCT_KEY } from '@/plugins/builder/blueprints/Kettle';
import {
  BORDER_KEY,
  COLOR_KEY,
  PID_KEY,
  PUMP_KEY,
  PWM_KEY,
  SENSOR_KEY,
  SETPOINT_KEY,
} from '@/plugins/builder/const';
import { BuilderLayout, BuilderPart } from '@/plugins/builder/types';
import { BlockAddress } from '@/plugins/spark/types';
import { typed } from '@/utils/misc';
import { withPrefix } from '../utils';
import { GlycolConfig } from './types';

export function defineLayouts(config: GlycolConfig): BuilderLayout[] {
  const { serviceId, names } = config;
  const heatingParts: BuilderPart[] = [];
  const glycolParts: BuilderPart[] = [];

  if (config.heated) {
    heatingParts.push(
      {
        id: nanoid(),
        rotate: 0,
        settings: {
          [BORDER_KEY]: false,
          [PID_KEY]: typed<BlockAddress>({
            serviceId,
            id: names.heatPid,
            type: null,
          }),
        },
        flipped: false,
        type: 'PidDisplay',
        x: 2,
        y: 5,
        width: 1,
        height: 1,
      },
      {
        id: nanoid(),
        rotate: 0,
        settings: {
          [BORDER_KEY]: false,
          [PWM_KEY]: typed<BlockAddress>({
            serviceId,
            id: names.heatPwm,
            type: null,
          }),
        },
        flipped: false,
        type: 'PwmDisplay',
        x: 2,
        y: 6,
        width: 1,
        height: 1,
      },
    );
  }

  if (config.glycolControl === 'Control') {
    glycolParts.push(
      {
        id: nanoid(),
        rotate: 0,
        settings: {
          [BORDER_KEY]: false,
          [SETPOINT_KEY]: typed<BlockAddress>({
            serviceId,
            id: names.glycolSetpoint,
            type: null,
          }),
        },
        flipped: false,
        type: 'SetpointDisplay',
        x: 6,
        y: 8,
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
            id: names.glycolPid,
            type: null,
          }),
        },
        flipped: false,
        type: 'PidDisplay',
        x: 7,
        y: 6,
        width: 1,
        height: 1,
      },
    );
  } else if (config.glycolControl === 'Measure') {
    glycolParts.push({
      id: nanoid(),
      rotate: 0,
      settings: {
        [SENSOR_KEY]: typed<BlockAddress>({
          serviceId,
          id: names.glycolSensor,
          type: null,
        }),
      },
      flipped: false,
      type: 'SensorDisplay',
      x: 7,
      y: 7,
      width: 1,
      height: 1,
    });
  }

  return [
    {
      id: nanoid(),
      title: withPrefix(config.prefix, 'Layout'),
      width: 9,
      height: 11,
      parts: [
        ...heatingParts,
        ...glycolParts,
        {
          id: nanoid(),
          rotate: 0,
          settings: {
            [SETPOINT_KEY]: typed<BlockAddress>({
              serviceId,
              id: names.beerSetpoint,
              type: null,
            }),
          },
          flipped: false,
          type: 'Conical',
          x: 1,
          y: 1,
          width: 3,
          height: 9,
        },
        {
          id: nanoid(),
          rotate: 0,
          settings: {},
          flipped: true,
          type: 'Coil',
          x: 1,
          y: 3,
          width: 3,
          height: 2,
        },
        {
          id: nanoid(),
          rotate: 0,
          settings: {
            [COLOR_KEY]: '#69bcff',
            [KETTLE_FILL_PCT_KEY]: 100,
          },
          flipped: false,
          type: 'Kettle',
          x: 6,
          y: 7,
          width: 2,
          height: 3,
        },
        {
          id: nanoid(),
          rotate: 0,
          settings: {},
          flipped: false,
          type: 'StraightInletTube',
          x: 6,
          y: 9,
          width: 1,
          height: 1,
        },
        {
          id: nanoid(),
          rotate: 0,
          settings: {},
          flipped: false,
          type: 'StraightInletTube',
          x: 6,
          y: 7,
          width: 1,
          height: 1,
        },
        {
          id: nanoid(),
          rotate: 0,
          settings: {},
          flipped: false,
          type: 'ElbowTube',
          x: 4,
          y: 9,
          width: 1,
          height: 1,
        },
        {
          id: nanoid(),
          rotate: 180,
          settings: {},
          flipped: false,
          type: 'ElbowTube',
          x: 4,
          y: 4,
          width: 1,
          height: 1,
        },
        {
          id: nanoid(),
          rotate: 180,
          settings: {},
          flipped: false,
          type: 'ElbowTube',
          x: 5,
          y: 3,
          width: 1,
          height: 1,
        },
        {
          id: nanoid(),
          rotate: 0,
          settings: {},
          flipped: false,
          type: 'ElbowTube',
          x: 5,
          y: 7,
          width: 1,
          height: 1,
        },
        {
          id: nanoid(),
          rotate: 90,
          settings: {},
          flipped: false,
          type: 'StraightTube',
          x: 4,
          y: 8,
          width: 1,
          height: 1,
        },
        {
          id: nanoid(),
          rotate: 90,
          settings: {},
          flipped: false,
          type: 'StraightTube',
          x: 4,
          y: 7,
          width: 1,
          height: 1,
        },
        {
          id: nanoid(),
          rotate: 90,
          settings: {},
          flipped: false,
          type: 'StraightTube',
          x: 4,
          y: 6,
          width: 1,
          height: 1,
        },
        {
          id: nanoid(),
          rotate: 90,
          settings: {},
          flipped: false,
          type: 'StraightTube',
          x: 4,
          y: 5,
          width: 1,
          height: 1,
        },
        {
          id: nanoid(),
          rotate: 180,
          settings: {},
          flipped: false,
          type: 'StraightTube',
          x: 4,
          y: 3,
          width: 1,
          height: 1,
        },
        {
          id: nanoid(),
          rotate: 180,
          settings: {},
          flipped: false,
          type: 'StraightTube',
          x: 5,
          y: 9,
          width: 1,
          height: 1,
        },
        {
          id: nanoid(),
          rotate: 90,
          settings: {},
          flipped: false,
          type: 'StraightTube',
          x: 5,
          y: 5,
          width: 1,
          height: 1,
        },
        {
          id: nanoid(),
          rotate: 90,
          settings: {},
          flipped: false,
          type: 'StraightTube',
          x: 5,
          y: 6,
          width: 1,
          height: 1,
        },
        {
          id: nanoid(),
          rotate: 0,
          settings: {
            [BORDER_KEY]: false,
            [PID_KEY]: typed<BlockAddress>({
              serviceId,
              id: names.coolPid,
              type: null,
            }),
          },
          flipped: false,
          type: 'PidDisplay',
          x: 6,
          y: 4,
          width: 1,
          height: 1,
        },
        {
          id: nanoid(),
          rotate: 90,
          settings: {
            [PUMP_KEY]: typed<BlockAddress>({
              serviceId,
              id: names.coolPwm,
              type: null,
            }),
          },
          flipped: false,
          type: 'Pump',
          x: 5,
          y: 4,
          width: 1,
          height: 1,
        },
      ],
    },
  ];
}
