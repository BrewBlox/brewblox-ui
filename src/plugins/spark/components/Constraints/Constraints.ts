import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';

import { ConstraintsObj } from './types';

export interface ConstraintInfo {
  key: string;
  value: any;
  limiting?: boolean;
}

const asInfo = (con: any): ConstraintInfo => {
  const keys = Object.keys(con);
  const [key] = keys.filter(item => item !== 'limiting');
  return { key, value: con[key], limiting: con.limiting };
};

const asConstraint =
  (cinfo: ConstraintInfo): Record<string, any> => ({ [cinfo.key]: cinfo.value });

@Component
export default class Constraints extends Vue {

  @Prop({ type: Object, default: () => ({ constraints: [], unconstrained: 2 }) })
  protected readonly field!: ConstraintsObj;

  @Prop({ type: Function, required: true })
  protected readonly change!: (c: ConstraintsObj) => void;

  @Prop({ type: String, required: true })
  protected readonly serviceId!: string;

  @Prop({ type: Boolean, default: false })
  protected readonly readonly!: boolean;

  protected get constraints(): ConstraintInfo[] {
    return this.field.constraints.map(asInfo);
  }

  protected saveConstraints(vals: ConstraintInfo[] = this.constraints): void {
    const constraints = vals
      .filter(info => !!info.key)
      .map(asConstraint);
    this.change({ ...this.field, constraints });
  }

  protected callAndSaveConstraints(func: (v: any) => void): (v: any) => void {
    return (v: any) => { func(v); this.saveConstraints(); };
  }

  protected removeConstraint(index: number): void {
    this.$delete(this.constraints, index);
  }
}
