import { Link, Qty } from '@/plugins/spark/bloxfield';

export type AnalogConstraintKey =
  | 'min'
  | 'max'
  | 'balanced'

export interface MinConstraint {
  limiting: boolean;
  min: number;
}

export interface MaxConstraint {
  limiting: boolean;
  max: number;
}

export interface BalancedConstraint {
  limiting: boolean;
  balanced: {
    balancerId: Link;
    granted: number;
    id: number;
  };
}

export type AnalogConstraint =
  | MinConstraint
  | MaxConstraint
  | BalancedConstraint;

export type DigitalConstraintKey =
  | 'mutexed'
  | 'minOff'
  | 'minOn'
  | 'delayedOff'
  | 'delayedOn'

export interface MinOnConstraint {
  remaining: Qty;
  minOn: Qty;
}

export interface MinOffConstraint {
  remaining: Qty;
  minOff: Qty;
}

export interface MutexedConstraint {
  remaining: Qty;
  mutexed: {
    mutexId: Link;
    extraHoldTime: Qty;
    hasCustomHoldTime: boolean;
    hasLock: boolean;
  };
}

export interface DelayedOnConstraint {
  remaining: Qty;
  delayedOn: Qty;
}

export interface DelayedOffConstraint {
  remaining: Qty;
  delayedOff: Qty;
}

export type DigitalConstraint =
  | MutexedConstraint
  | MinOnConstraint
  | MinOffConstraint
  | DelayedOnConstraint
  | DelayedOffConstraint;

export interface AnalogConstraintsObj {
  constraints: AnalogConstraint[];
}

export interface DigitalConstraintsObj {
  constraints: DigitalConstraint[];
}

export interface AnyConstraintsObj {
  constraints: (AnalogConstraint | DigitalConstraint)[];
}
