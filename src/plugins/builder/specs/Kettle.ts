import { Coordinates } from '@/helpers/coordinates';

import { PartSpec, PersistentPart } from '../types';

const DEFAULT_SIZE_X = 4;
const DEFAULT_SIZE_Y = 6;

const size = (part: PersistentPart): [number, number] => [
  part.settings.sizeX || DEFAULT_SIZE_X,
  part.settings.sizeY || DEFAULT_SIZE_Y,
];

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
  size,
  transitions: (part: PersistentPart) => {
    const [sizeX, sizeY] = size(part);

    const coords = Array(sizeX * sizeY).fill(0).map((v, n) => {
      const outFlow = new Coordinates({ x: (n % sizeX) + 0.5, y: Math.floor(n / sizeX) + 0.5, z: 0 });
      const inFlow = new Coordinates({ x: (n % sizeX) + 0.1, y: Math.floor(n / sizeX) + 0.1, z: 0 });
      return { in: inFlow.toString(), out: outFlow.toString() };
    });

    const result = {};

    coords.forEach(item => {
      result[item.out] = [{
        outCoords: item.in,
        friction: 0,
        sink: true,
      }];

      result[item.in] = [{
        outCoords: item.out,
        pressure: 0,
        friction: 0,
        liquids: part.settings.color ? [part.settings.color] : [],
        source: true,
      }];
    });
    return result;
  },
};

export default spec;
