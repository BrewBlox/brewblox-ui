import Vue from 'vue';
import Component from 'vue-class-component';
import { clone } from 'lodash';

export interface ConstraintInfo {
  key: string;
  value: any;
  blocking?: boolean;
}

const asInfo = (con: any): ConstraintInfo => {
  const [key, ..._] = Object.keys(con);
  return { key, value: con[key] };
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
    if (this.$props.field.blocking > 0) {
      cons[this.$props.field.blocking - 1]['blocking'] = true;
    }
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
