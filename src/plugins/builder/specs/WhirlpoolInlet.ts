import { CENTER, LEFT } from '@/plugins/builder/const';
import { PartSpec } from '@/plugins/builder/types';
import { Coordinates } from '@/utils/coordinates';

const SIZE_X = 1;
const SIZE_Y = 4;
const OUT = new Coordinates(CENTER)
  .translate([0, SIZE_Y - 1, 0])
  .toString();

const spec: PartSpec = {
  id: 'WhirlpoolInlet',
  title: 'Kettle inlet: whirlpool',
  cards: [],
  size: () => [SIZE_X, SIZE_Y],
  transitions: () => ({
    [LEFT]: [{ outCoords: OUT }],
    [OUT]: [{ outCoords: LEFT }],
  }),
};

export default spec;
