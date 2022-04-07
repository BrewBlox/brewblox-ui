import { CENTER, DOWN, LEFT, RIGHT, UP } from '@/plugins/builder/const';
import { BuilderBlueprint } from '@/plugins/builder/types';

const blueprint: BuilderBlueprint = {
  type: 'CrossTube',
  title: 'Tube: cross',
  cards: [],
  size: () => [1, 1],
  transitions: () => ({
    [UP]: [{ outCoords: CENTER, internal: true, friction: 0.5 }],
    [RIGHT]: [{ outCoords: CENTER, internal: true, friction: 0.5 }],
    [LEFT]: [{ outCoords: CENTER, internal: true, friction: 0.5 }],
    [DOWN]: [{ outCoords: CENTER, internal: true, friction: 0.5 }],
    [CENTER]: [
      { outCoords: UP, friction: 0.5 },
      { outCoords: LEFT, friction: 0.5 },
      { outCoords: RIGHT, friction: 0.5 },
      { outCoords: DOWN, friction: 0.5 },
    ],
  }),
};

export default blueprint;
