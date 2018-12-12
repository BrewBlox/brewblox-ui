import { ElbowTube, InputTube, OutputTube, StraightTube, TeeTube } from './Tubes/index';
import { Valve } from './Valves/index';

export const allParts: { [key: string]: any } = {
  TUBE_STRAIGHT: StraightTube,
  TUBE_INPUT: InputTube,
  TUBE_OUTPUT: OutputTube,
  TUBE_ELBOW: ElbowTube,
  TUBE_TEE: TeeTube,
  VALVE: Valve,
};

export function componentByType(type: ProcessViewPartType): ProcessViewComponent {
  if (!allParts[type]) {
    throw new Error(`Cannot find ProcessView part '${type}'`);
  }
  return allParts[type];
}
