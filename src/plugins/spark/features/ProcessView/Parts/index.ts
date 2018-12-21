import { ComponentConstructor } from '../state';
import Tubes from './Tubes';
import Valves from './Valves';

export const allParts = {
  ...Tubes,
  ...Valves,
};

export const componentByType = (type: string): ComponentConstructor => {
  if (!allParts[type]) {
    throw new Error(`Cannot find ProcessView part '${type}'`);
  }
  return allParts[type];
};
