import { uid } from 'quasar';

import { BuilderLayout } from '@/plugins/builder/types';

import { FermentConfig } from './types';

export const defineLayouts = (config: FermentConfig): BuilderLayout[] => {
  const serviceId = config.serviceId;
  return [
    {
      id: uid(),
      title: `${config.prefix} Layout`,
      width: 6,
      height: 10,
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
            text: `${config.prefix} fridge`,
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
              blockId: config.names.beerSSPair,
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
              blockId: config.names.fridgeSSPair,
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
