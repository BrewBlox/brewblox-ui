import Link from '@/helpers/units/Link';

export interface MinOffConstraint {
  minOff: number;
}

export interface MaxOffConstraint {
  maxOff: number;
}

export interface MutexConstraint {
  mutex: Link;
}

export type DigitalConstraint = MinOffConstraint | MaxOffConstraint | MutexConstraint;
