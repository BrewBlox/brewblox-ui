import { ComponentSettings, Transitions, StatePart } from '../types';
import { LEFT, RIGHT, defaultSettings } from '../getters';
import { post } from '@/helpers/fetch';
import { Notify } from 'quasar';

const intercept = (message: string): (e: Error) => never =>
  (e: Error) => {
    Notify.create({
      icon: 'warning',
      message: `${message}: ${e.message}`,
    });
    throw e;
  };

const settings: ComponentSettings = {
  ...defaultSettings,
  cards: ['ValvePartCard'],
  transitions: (part: StatePart): Transitions =>
    ((part.settings || {}).closed)
      ? {}
      : {
        [LEFT]: [{ outCoords: RIGHT }],
        [RIGHT]: [{ outCoords: LEFT }],
      },

  interactHandler: (part: StatePart) => {
    if (part.settings.valveid !== undefined) {
      const message = part.settings.valveid + (part.settings.closed ? '1' : '0');
      console.log(message);
      post(
        'https://valves.local:9001/valves/write',
        {
          message,
        },
      ).catch(intercept(`Failed to write valves: ${0}`));

      part.settings.closed = !part.settings.closed;
    }
  },
};

export default settings;
