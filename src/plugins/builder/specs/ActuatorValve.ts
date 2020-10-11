import { Notify } from 'quasar';

import axios from 'axios';

import { LEFT, RIGHT } from '../getters';
import { PartSpec, PartUpdater, PersistentPart, Transitions } from '../types';

const intercept = (message: string): (e: Error) => never =>
  (e: Error) => {
    Notify.create({
      icon: 'warning',
      message: `${message}: ${e.message}`,
    });
    throw e;
  };

const spec: PartSpec = {
  id: 'ActuatorValve',
  title: 'Valve: actuator',
  size: () => [1, 1],
  cards: [{
    component: 'TextCard',
    props: {
      settingsKey: 'valveid',
      label: 'ID',
    },
  }],
  transitions: (part: PersistentPart): Transitions => {
    return !part.settings.closed
      ? {
        [LEFT]: [{ outCoords: RIGHT }],
        [RIGHT]: [{ outCoords: LEFT }],
      }
      : {};
  },
  interactHandler: (part: PersistentPart, updater: PartUpdater) => {
    updater.updatePart(part);
    if (part.settings.valveid !== undefined) {
      const message = part.settings.valveid + (part.settings.closed ? '1' : '0');
      console.log(message);

      axios.post(
        'https://192.168.1.106:9001/valves/write',
        {
          "message": message
        },
      ).catch(intercept(`Failed to write valves: ${0}`));

      part.settings.closed = !part.settings.closed;
    }
  },
};

export default spec;
