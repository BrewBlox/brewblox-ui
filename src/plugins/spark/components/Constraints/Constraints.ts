import Vue from 'vue';
import Component from 'vue-class-component';

export interface ConstraintsObj {
  constraints: any[];
  unconstrained: number;
}

export interface ConstraintInfo {
  key: string;
  value: any;
  limiting?: boolean;
}

const asInfo = (con: any): ConstraintInfo => {
  const keys = Object.keys(con);
  const [key, ...omit] = keys.filter(item => item !== 'limiting');
  return { key, value: con[key], limiting: con.limiting };
};

const asConstraint = (cinfo: ConstraintInfo) =>
  ({ [cinfo.key]: cinfo.value });

@Component({
  props: {
    field: {
      type: Object,
      default: () => ({ constraints: [] }),
    },
    change: {
      type: Function,
      default: () => () => { },
    },
    serviceId: {
      type: String,
      required: true,
    },
  },
})
export default class Constraints extends Vue {
  get constraints(): ConstraintInfo[] {
    const cons =  this.$props
      .field
      .constraints
      .map(asInfo);

    return cons;
  }

  saveConstraints(vals: ConstraintInfo[] = this.constraints) {
    const constraints = vals
      .filter(info => !!info.key)
      .map(asConstraint);
    this.$props.change({ constraints });
  }

  callAndSaveConstraints(func: (v: any) => void) {
    return (v: any) => { func(v); this.saveConstraints(); };
  }

  removeConstraint(index: number) {
    this.$delete(this.constraints, index);
  }
}
