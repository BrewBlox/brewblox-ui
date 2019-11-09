import Vue from 'vue';
import { Component, Emit, Prop } from 'vue-property-decorator';

import { constraintLabels } from '../helpers';
import { AnalogConstraint, ConstraintsObj, DigitalConstraint } from '../types';

export interface EditableConstraint {
  key: string;
  value: any;
  limiting: boolean;
}

const asEditable =
  (con: AnalogConstraint | DigitalConstraint): EditableConstraint => {
    const keys = Object.keys(con);
    const [key] = keys.filter(item => item !== 'limiting');
    return { key, value: con[key], limiting: con.limiting };
  };

const asData =
  (cinfo: EditableConstraint): AnalogConstraint | DigitalConstraint =>
    ({ [cinfo.key]: cinfo.value, limiting: cinfo.limiting });

@Component
export default class ConstraintsBase extends Vue {
  @Prop({ type: Object, default: () => ({ constraints: [] }) })
  protected readonly value!: ConstraintsObj;

  @Prop({ type: String, required: true })
  protected readonly serviceId!: string;

  protected get constraints(): EditableConstraint[] {
    // Typescript loses the plot here
    return (this.value.constraints as any).map(asEditable);
  }

  protected label(k: string): string {
    return constraintLabels.get(k) || k;
  }

  @Emit('input')
  protected saveConstraints(vals: EditableConstraint[] = this.constraints): ConstraintsObj {
    const constraints = vals
      .filter(info => !!info.key)
      .map(asData);
    return { ...this.value, constraints };
  }

  protected removeConstraint(index: number): void {
    this.$delete(this.constraints, index);
  }
}
