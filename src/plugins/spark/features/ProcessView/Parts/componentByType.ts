import { ElbowTube, InputTube, OutputTube, StraightTube, TeeTube } from './Tubes/index';
import { Valve } from './Valves/index';

const parts: { [name in ProcessViewPartType]: any } = {
  TUBE_STRAIGHT: StraightTube,
  TUBE_INPUT: InputTube,
  TUBE_OUTPUT: OutputTube,
  TUBE_ELBOW: ElbowTube,
  TUBE_TEE: TeeTube,
  VALVE: Valve,
};

export default function componentByType(type: ProcessViewPartType): ProcessViewComponent {
  if (!parts[type]) {
    throw new Error(`Cannot find ProcessView part '${type}'`);
  }

  return parts[type];
}
