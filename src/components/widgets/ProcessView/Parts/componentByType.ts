import { StraightTube, InputTube, OutputTube, ElbowTube, TeeTube } from './Tubes';

const parts: { [name in ProcessViewPartType]: any } = {
  TUBE_STRAIGHT: StraightTube,
  TUBE_INPUT: InputTube,
  TUBE_OUTPUT: OutputTube,
  TUBE_ELBOW: ElbowTube,
  TUBE_TEE: TeeTube,
};

export default function componentByType(type: ProcessViewPartType) {
  if (!parts[type]) {
    throw new Error(`Cannot find ProcessView part '${type}'`);
  }

  return parts[type];
}
