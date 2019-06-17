import { Link } from '@/helpers/units';
import { ConstraintsObj } from '@/plugins/spark/components/Constraints/ConstraintsBase';
import { Block, DigitalState } from '@/plugins/spark/types';

export enum ValveState {
  Unknown = 0,
  Open = 1,
  Closed = 2,
  Opening = 3,
  Closing = 4,
  HalfOpenIdle = 5,
  InitIdle = 6,
}

export interface MotorValveBlock extends Block {
  data: {
    hwDevice: Link;
    startChannel: number;
    state: DigitalState;
    valveState: ValveState;
    constrainedBy: ConstraintsObj;
  };
}
