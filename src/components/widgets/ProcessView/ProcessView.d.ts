type ProcessViewPartType =
  'TUBE_STRAIGHT' |
  'TUBE_INPUT' |
  'TUBE_OUTPUT' |
  'TUBE_TEE' |
  'TUBE_ELBOW';

type ProcessViewPart = {
  x: number;
  y: number;
  rotate: number;
  type: ProcessViewPartType;
};
