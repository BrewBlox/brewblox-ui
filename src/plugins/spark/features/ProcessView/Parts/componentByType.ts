import { ElbowTube, InputTube, OutputTube, StraightTube, TeeTube } from './Tubes/index';
import { Valve } from './Valves/index';
import { ComponentConstructor } from '../state';

export const allParts: { [key: string]: any } = {
  TUBE_STRAIGHT: StraightTube,
  TUBE_INPUT: InputTube,
  TUBE_OUTPUT: OutputTube,
  TUBE_ELBOW: ElbowTube,
  TUBE_TEE: TeeTube,
  VALVE: Valve,
};

export const componentByType = (type: string): ComponentConstructor => {
  if (!allParts[type]) {
    throw new Error(`Cannot find ProcessView part '${type}'`);
  }
  return allParts[type];
};
