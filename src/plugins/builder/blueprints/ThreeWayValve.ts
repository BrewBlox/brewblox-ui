import {
  CENTER,
  DOWN,
  LEFT,
  RIGHT,
  VALVE_POSITION_KEY,
} from '@/plugins/builder/const';
import {
  BuilderBlueprint,
  BuilderPart,
  PartTransitions,
} from '@/plugins/builder/types';

const blueprint: BuilderBlueprint = {
  type: 'ThreeWayValve',
  title: 'Valve: three way',
  component: 'ThreeWayValvePartComponent',
  defaultSize: { width: 1, height: 1 },
  transitions: (part: BuilderPart) => {
    // clockwise, starting at the top
    const position = part.settings[VALVE_POSITION_KEY];

    switch (position) {
      case 3:
        return {
          [RIGHT]: [{ outCoords: CENTER, internal: true, friction: 0.5 }],
          [DOWN]: [{ outCoords: CENTER, internal: true, friction: 0.5 }],
          [CENTER]: [
            { outCoords: RIGHT, friction: 0.5 },
            { outCoords: DOWN, friction: 0.5 },
          ],
        } as PartTransitions;
      case 2:
        return {
          [LEFT]: [{ outCoords: CENTER, internal: true, friction: 0.5 }],
          [RIGHT]: [{ outCoords: CENTER, internal: true, friction: 0.5 }],
          [CENTER]: [
            { outCoords: LEFT, friction: 0.5 },
            { outCoords: RIGHT, friction: 0.5 },
          ],
        } as PartTransitions;
      case 1:
        return {
          [LEFT]: [{ outCoords: CENTER, internal: true, friction: 0.5 }],
          [DOWN]: [{ outCoords: CENTER, internal: true, friction: 0.5 }],
          [CENTER]: [
            { outCoords: LEFT, friction: 0.5 },
            { outCoords: DOWN, friction: 0.5 },
          ],
        } as PartTransitions;
      default:
        return {
          [LEFT]: [{ outCoords: CENTER, internal: true, friction: 0.5 }],
          [RIGHT]: [{ outCoords: CENTER, internal: true, friction: 0.5 }],
          [DOWN]: [{ outCoords: CENTER, internal: true, friction: 0.5 }],
          [CENTER]: [
            { outCoords: LEFT, friction: 0.5 },
            { outCoords: RIGHT, friction: 0.5 },
            { outCoords: DOWN, friction: 0.5 },
          ],
        } as PartTransitions;
    }
  },
};

export default blueprint;
