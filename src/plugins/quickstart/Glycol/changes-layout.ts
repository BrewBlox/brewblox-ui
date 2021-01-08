import { uid } from 'quasar';

import { BuilderLayout, PersistentPart } from '@/plugins/builder/types';

import { withPrefix } from '../helpers';
import { GlycolConfig } from './types';


export function defineLayouts(config: GlycolConfig): BuilderLayout[] {
  const { serviceId, names } = config;
  const heatingParts: PersistentPart[] = [];
  const glycolParts: PersistentPart[] = [];

  if (config.heated) {
    heatingParts.push(
      {
        id: uid(),
        rotate: 0,
        settings: {
          bordered: false,
          pid: { serviceId, blockId: names.heatPid },
        },
        flipped: false,
        type: 'PidDisplay',
        x: 2,
        y: 5,
      },
      {
        id: uid(),
        rotate: 0,
        settings: {
          bordered: false,
          pwm: { serviceId, blockId: names.heatPwm },
        },
        flipped: false,
        type: 'PwmDisplay',
        x: 2,
        y: 6,
      });
  }

  if (config.glycolControl === 'Control') {
    glycolParts.push(
      {
        id: uid(),
        rotate: 0,
        settings: {
          bordered: false,
          setpoint: { serviceId, blockId: names.glycolSetpoint },
        },
        flipped: false,
        type: 'SetpointDisplay',
        x: 6,
        y: 8,
      },
      {
        id: uid(),
        rotate: 0,
        settings: {
          bordered: false,
          pid: { serviceId, blockId: names.glycolPid },
        },
        flipped: false,
        type: 'PidDisplay',
        x: 7,
        y: 6,
      });
  }
  else if (config.glycolControl === 'Measure') {
    glycolParts.push(
      {
        id: uid(),
        rotate: 0,
        settings: { sensor: { serviceId, blockId: names.glycolSensor } },
        flipped: false,
        type: 'SensorDisplay',
        x: 7,
        y: 7,
      });
  }

  return [
    {
      id: uid(),
      title: withPrefix(config.prefix, 'Layout'),
      width: 9,
      height: 11,
      parts: [
        ...heatingParts,
        ...glycolParts,
        {
          id: uid(),
          rotate: 0,
          settings: {
            setpoint: { serviceId, blockId: names.beerSetpoint },
          },
          flipped: false,
          type: 'Conical',
          x: 1,
          y: 1,
        },
        {
          id: uid(),
          rotate: 0,
          settings: {},
          flipped: true,
          type: 'Coil',
          x: 1,
          y: 3,
        },
        {
          id: uid(),
          rotate: 0,
          settings: {
            sizeX: 2,
            sizeY: 3,
            emptySpace: 0,
            color: '#69bcff',
            fillPct: 100,
          },
          flipped: false,
          type: 'Kettle',
          x: 6,
          y: 7,
        },
        {
          id: uid(),
          rotate: 0,
          settings: {},
          flipped: false,
          type: 'StraightInletTube',
          x: 6,
          y: 9,
        },
        {
          id: uid(),
          rotate: 0,
          settings: {},
          flipped: false,
          type: 'StraightInletTube',
          x: 6,
          y: 7,
        },
        {
          id: uid(),
          rotate: 0,
          settings: {},
          flipped: false,
          type: 'ElbowTube',
          x: 4,
          y: 9,
        },
        {
          id: uid(),
          rotate: 180,
          settings: {},
          flipped: false,
          type: 'ElbowTube',
          x: 4,
          y: 4,
        },
        {
          id: uid(),
          rotate: 180,
          settings: {},
          flipped: false,
          type: 'ElbowTube',
          x: 5,
          y: 3,
        },
        {
          id: uid(),
          rotate: 0,
          settings: {},
          flipped: false,
          type: 'ElbowTube',
          x: 5,
          y: 7,
        },
        {
          id: uid(),
          rotate: 90,
          settings: {},
          flipped: false,
          type: 'StraightTube',
          x: 4,
          y: 8,
        },
        {
          id: uid(),
          rotate: 90,
          settings: {},
          flipped: false,
          type: 'StraightTube',
          x: 4,
          y: 7,
        },
        {
          id: uid(),
          rotate: 90,
          settings: {},
          flipped: false,
          type: 'StraightTube',
          x: 4,
          y: 6,
        },
        {
          id: uid(),
          rotate: 90,
          settings: {},
          flipped: false,
          type: 'StraightTube',
          x: 4,
          y: 5,
        },
        {
          id: uid(),
          rotate: 180,
          settings: {},
          flipped: false,
          type: 'StraightTube',
          x: 4,
          y: 3,
        },
        {
          id: uid(),
          rotate: 180,
          settings: {},
          flipped: false,
          type: 'StraightTube',
          x: 5,
          y: 9,
        },
        {
          id: uid(),
          rotate: 90,
          settings: {},
          flipped: false,
          type: 'StraightTube',
          x: 5,
          y: 5,
        },
        {
          id: uid(),
          rotate: 90,
          settings: {},
          flipped: false,
          type: 'StraightTube',
          x: 5,
          y: 6,
        },
        {
          id: uid(),
          rotate: 0,
          settings: {
            bordered: false,
            pid: { serviceId, blockId: names.coolPid },
          },
          flipped: false,
          type: 'PidDisplay',
          x: 6,
          y: 4,
        },
        {
          id: uid(),
          rotate: 90,
          settings: {
            actuator: { serviceId, blockId: names.coolPwm },
          },
          flipped: false,
          type: 'Pump',
          x: 5,
          y: 4,
        },
      ],
    },
  ];
}
