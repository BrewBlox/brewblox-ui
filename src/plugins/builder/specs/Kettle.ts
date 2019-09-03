import { Coordinates } from '@/helpers/coordinates';

import { IN_OUT } from '../getters';
import { PartSpec, PersistentPart } from '../types';

const DEFAULT_SIZE_X = 4;
const DEFAULT_SIZE_Y = 6;

const spec: PartSpec = {
  id: 'Kettle',
  cards: [
    { component: 'TextCard' },
    { component: 'ColorCard' },
    {
      component: 'SizeCard',
      props: {
        settingsKey: 'sizeX',
        defaultSize: DEFAULT_SIZE_X,
        label: 'Width',
        min: 2,
        max: 10,
      },
    },
    {
      component: 'SizeCard',
      props: {
        settingsKey: 'sizeY',
        defaultSize: DEFAULT_SIZE_Y,
        label: 'Height',
        min: 2,
        max: 10,
      },
    },
  ],
  size: (part: PersistentPart) => [
    part.settings.sizeX || DEFAULT_SIZE_X,
    part.settings.sizeY || DEFAULT_SIZE_Y,
  ],
  transitions: (part: PersistentPart) => {
    const sizeX: number = DEFAULT_SIZE_X;
    const sizeY: number = DEFAULT_SIZE_Y;

    const middleCoords = Array(sizeX * sizeY).fill(0).map((v, n) => {
      const coord = new Coordinates({ x: (n % sizeX) + 0.5, y: Math.floor(n / sizeX) + 0.5, z: 0 });
      return coord.toString();
    });

    const result = {
      "0.1,0.1,0": [{
        outCoords: '0,0,-2',
        pressure: 0,
        liquids: part.settings.color ? [part.settings.color] : [],
        internal: true,
        source: true,
      },
      ],
      '0,0,-2': middleCoords.map(item => ({
        outCoords: item,
      })),
    };

    middleCoords.forEach(item => (
      result[item] = [{
        outCoords: "0.2,0.2,0",
        sink: true,
        internal: true,
      },
      ]));
    return result;
  },
};

export default spec;
