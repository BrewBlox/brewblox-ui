import { Straight, Input, Output, Elbow, Tee } from '@/components/widgets/ProcessView/Parts/Tubes/Tubes';

const parts: { [name in ProcessViewPartType]: any } = {
  TUBE_STRAIGHT: Straight,
  TUBE_INPUT: Input,
  TUBE_OUTPUT: Output,
  TUBE_ELBOW: Elbow,
  TUBE_TEE: Tee,
};

export default function componentByType(type: ProcessViewPartType) {
  if (!parts[type]) {
    throw new Error(`Cannot find ProcessView part '${type}'`);
  }

  return parts[type];
}
