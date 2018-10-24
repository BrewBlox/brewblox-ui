import Vue from 'vue';
import Component from 'vue-class-component';
import { Watch } from 'vue-property-decorator';
import { Link } from '@/helpers/units';
import { uniqueFilter } from '@/helpers/functional';
import { profileNames, isFetching, compatibleBlocks } from '@/plugins/spark/store/getters';
import { fetchCompatibleBlocks } from '@/plugins/spark/store/actions';

export interface ConstraintInfo {
  key: string;
  value: any;
}

const asInfo = (con: any): ConstraintInfo => {
  const [key, ..._] = Object.keys(con);
  return { key, value: con[key] };
};

@Component({
  props: {
    value: {
      type: Object,
      default: () => ({ constraints: [] }),
    },
    serviceId: {
      type: String,
      required: true,
    },
  },
})
export default class Constraints extends Vue {
  get constraints(): ConstraintInfo[] {
    return this.$props
      .value
      .constraints
      .map(asInfo);
  }

  onChanged(vals: ConstraintInfo[]) {
    const constraints = vals
      .filter(info => !!info.key)
      .map(info => ({ [info.key]: info.value }));
    this.$emit('input', { constraints });
  }

  addConstraint(cinfo: ConstraintInfo) {
    this.onChanged([...this.constraints, cinfo]);
  }

  updateConstraint(index: number, cinfo: ConstraintInfo) {
    this.constraints[index] = cinfo;
    this.onChanged(this.constraints);
  }

  get isFetching() {
    return isFetching(this.$store, this.$props.serviceId);
  }

  get compatibleBlocks() {
    return compatibleBlocks(this.$store, this.$props.serviceId);
  }

  fetchCompatibleBlocks(type: string) {
    fetchCompatibleBlocks(this.$store, this.$props.serviceId, type);
  }

  @Watch('constraints', { immediate: true })
  fetchCompatibleToInputLinks() {
    this.constraints
      .reduce(
        (acc: string[], cinfo) => {
          if (cinfo.value instanceof Link && cinfo.value.type) {
            return [...acc, cinfo.value.type as string];
          }
          return acc;
        },
        [],
      )
      .filter(uniqueFilter)
      .forEach(this.fetchCompatibleBlocks);
  }

  linkOpts(link: Link) {
    return (this.compatibleBlocks[link.type || ''] || [])
      .map(id => ({
        label: id,
        value: id,
      }));
  }
}
