import { Notify } from 'quasar';

import { fetchJson } from '@/helpers/fetch';
import { serialize } from '@/helpers/units/parseObject';

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
  size: () => [1, 1],
  cards: [{
    component: 'TextCard',
    props: {
      settingsKey: 'valveid',
      defaultSize: 1,
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

      const post =
        async (data: any, method = 'POST'): Promise<any> =>
          fetchJson(
            'https://localhost:9001/valves/write',
            {
              method,
              body: JSON.stringify(serialize(data)),
              headers: new Headers({
                'Content-Type': 'application/json',
              }),
            },
          );

      post(
        {
          message,
        },
      ).catch(intercept(`Failed to write valves: ${0}`));

      part.settings.closed = !part.settings.closed;
    }
  },
};

export default spec;
