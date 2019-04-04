import { ComponentSettings, PersistentPart, Transitions } from '../state';
import { LEFT, RIGHT } from '../getters';
import { defaultSettings } from '../components/getters';

const settings: ComponentSettings = {
  ...defaultSettings,
  cards: ['ActuatorPartCard'],
  transitions: (part: PersistentPart): Transitions =>
    ((part.settings || {}).closed)
      ? {}
      : {
        [LEFT]: [{ outCoords: RIGHT }],
        [RIGHT]: [{ outCoords: LEFT }],
      },
};

export default settings;
