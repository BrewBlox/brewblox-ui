type ProcessViewPartType =
  'TUBE_STRAIGHT' |
  'TUBE_INPUT' |
  'TUBE_OUTPUT' |
  'TUBE_TEE' |
  'TUBE_ELBOW';

type ProcessViewPart = {
  type: ProcessViewPartType;
  x: number;
  y: number;
  rotate: number;
  direction?: number;
  flipped?: boolean;
};
