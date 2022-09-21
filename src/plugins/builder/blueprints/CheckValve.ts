import { LEFT, RIGHT } from '@/plugins/builder/const';
import { BuilderBlueprint, Transitions } from '@/plugins/builder/types';

const blueprint: BuilderBlueprint = {
  type: 'CheckValve',
  title: 'Valve: one way',
  cards: [],
  size: () => [1, 1],
  transitions: (): Transitions => ({
    [LEFT]: [{ outCoords: RIGHT }],
  }),
};

export default blueprint;
