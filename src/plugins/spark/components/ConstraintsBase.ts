import Vue from 'vue';
import { Component, Emit, Prop } from 'vue-property-decorator';

import { constraintLabels } from '../getters';
import {
  AnalogConstraint,
  AnalogConstraintKey,
  ConstraintsObj,
  DigitalConstraint,
  DigitalConstraintKey,
} from '../types';

type AnyConstraintKey = AnalogConstraintKey | DigitalConstraintKey;
type AnyConstraint = AnalogConstraint | DigitalConstraint;

export interface WrappedConstrained {
  type: AnyConstraintKey;
  constraint: AnyConstraint;
}

const wrapConstraint =
  (constraint: AnyConstraint): WrappedConstrained => {
    const type = Object.keys(constraint).find(k => k !== 'limiting') as AnyConstraintKey;
    return { type, constraint };
  };

const unwrapConstraint =
  (wrapped: WrappedConstrained): AnyConstraint =>
    wrapped.constraint;

@Component
export default class ConstraintsBase extends Vue {
  @Prop({ type: Object, default: () => ({ constraints: [] }) })
  protected readonly value!: ConstraintsObj;

  @Prop({ type: String, required: true })
  protected readonly serviceId!: string;

  protected saveConstraints(vals: WrappedConstrained[] = this.constraints): ConstraintsObj {
    const constraints = vals.map(unwrapConstraint);
    return { constraints };
  }

  protected get constraints(): WrappedConstrained[] {
    // Typescript loses the plot here
    return (this.value.constraints as AnyConstraint[]).map(wrapConstraint);
  }

  protected label(k: string): string {
    return constraintLabels[k] ?? k;
  }

  protected removeConstraint(index: number): void {
    this.$delete(this.constraints, index);
  }
}
