import { ComponentSettings, Transitions, StatePart, PartUpdater } from '../state';
import { LEFT, RIGHT, defaultSettings } from '../getters';
import { toJson } from '@/helpers/fetch';

import { Notify } from 'quasar';
import { serialize } from '@/helpers/units/parseObject';

const post =
  async (url: string, data: any, method = 'POST'): Promise<any> =>
    toJson(window.fetch(
      url,
      {
        method,
        body: JSON.stringify(serialize(data)),
        headers: new Headers({
          'Content-Type': 'application/json',
        }),
      },
    ));

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
  interactHandler: (part: StatePart, updater: PartUpdater) => {
    if (part.settings.valveid !== undefined) {
      const message = part.settings.valveid + (part.settings.closed ? '1' : '0');
      console.log(message);
      post(
        'https://localhost:9001/valves/write',
        {
          message,
        },
      )
        .catch(intercept(`Failed to write valves: ${0}`));
    }
    part.settings.closed = !part.settings.closed;
    updater.updatePart(part);
  },
};

export default settings;
