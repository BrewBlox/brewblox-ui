import { Link, Unit } from '@/plugins/spark/units';

export type AnalogConstraintKey = 'min' | 'max' | 'balanced';

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
  MinConstraint
  | MaxConstraint
  | BalancedConstraint;

export type DigitalConstraintKey =
  'mutexed'
  | 'minOff'
  | 'minOn'
  | 'delayedOff'
  | 'delayedOn';

export interface MinOnConstraint {
  remaining: Unit;
  minOn: Unit;
}

export interface MinOffConstraint {
  remaining: Unit;
  minOff: Unit;
}

export interface MutexedConstraint {
  remaining: Unit;
  mutexed: {
    mutexId: Link;
    extraHoldTime: Unit;
    hasCustomHoldTime: boolean;
    hasLock: boolean;
  };
}

export interface DelayedOnConstraint {
  remaining: Unit;
  delayedOn: Unit;
}

export interface DelayedOffConstraint {
  remaining: Unit;
  delayedOff: Unit;
}

export type DigitalConstraint =
  MutexedConstraint
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
