import { Straight } from '@/components/widgets/ProcessView/Parts/Tubes';

const parts: { [name in ProcessViewPartType]: any } = {
  TUBE_STRAIGHT: Straight,
  TUBE_INPUT: null,
  TUBE_OUTPUT: null,
  TUBE_ELBOW: null,
  TUBE_TEE: null,
};

export default function componentByType(type: ProcessViewPartType) {
  if (!parts[type]) {
    throw new Error(`Cannot find ProcessView part '${type}'`);
  }

  return parts[type];
}
