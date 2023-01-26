import { DOWN, LEFT, RIGHT, UP } from '@/plugins/builder/const';
import { BuilderBlueprint } from '@/plugins/builder/types';

const blueprint: BuilderBlueprint = {
  type: 'BridgeTube',
  title: 'Tube: bridge',
  component: 'BridgeTubePartComponent',
  defaultSize: { width: 1, height: 1 },
  transitions: () => ({
    // bridge (high)
    [LEFT]: [{ outCoords: RIGHT }],
    [RIGHT]: [{ outCoords: LEFT }],
    // straight (low)
    [UP]: [{ outCoords: DOWN }],
    [DOWN]: [{ outCoords: UP }],
  }),
};

export default blueprint;
