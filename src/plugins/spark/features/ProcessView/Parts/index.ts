import { ComponentConstructor } from '../state';
import Tubes from './Tubes';
import Valves from './Valves';
import Pumps from './Pumps';

export const allParts = {
  ...Tubes,
  ...Valves,
  ...Pumps,
};

export const componentByType = (type: string): ComponentConstructor => {
  if (!allParts[type]) {
    throw new Error(`Cannot find ProcessView part '${type}'`);
  }
  return allParts[type];
};
