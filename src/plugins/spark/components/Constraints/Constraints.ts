import Vue from 'vue';
import Component from 'vue-class-component';

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
    readonly: {
      type: Boolean,
      default: false,
    },
  },
})
export default class Constraints extends Vue {
  protected get constraints(): ConstraintInfo[] {
    const cons = this.$props
      .field
      .constraints
      .map(asInfo);

    return cons;
  }

  protected saveConstraints(vals: ConstraintInfo[] = this.constraints): void {
    const constraints = vals
      .filter(info => !!info.key)
      .map(asConstraint);
    this.$props.change({ constraints });
  }

  protected callAndSaveConstraints(func: (v: any) => void): (v: any) => void {
    return (v: any) => { func(v); this.saveConstraints(); };
  }

  protected removeConstraint(index: number): void {
    this.$delete(this.constraints, index);
  }
}
