import { Link } from '@/helpers/units';
import { ConstraintsObj } from '@/plugins/spark/components/Constraints/ConstraintsBase';
import { Block, DigitalState } from '@/plugins/spark/types';

export enum ValveState {
  Unknown = 0,
  Open,
  Closed,
  Opening,
  Closing,
  HalfOpenIdle,
  InitIdle,
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
