import Vue from 'vue';
import Component from 'vue-class-component';
import { Watch } from 'vue-property-decorator';
import { Notify } from 'quasar';
import { toShadow, fromShadow, ShadowMapping, deepCopy } from '@/helpers/shadow-copy';

@Component({
  props: {
    value: {
      type: Object,
      required: true,
    },
  },
})
export default class HistoryForm extends Vue {
  vals: { [key: string]: any; } = {};

  get inputMapping(): ShadowMapping {
    return {};
  }

  get inputValues(): { [key: string]: any; } {
    return this.vals;
  }

  set inputValues(values: { [key: string]: any; }) {
    this.vals = values;
  }

  get config() {
    return this.$props.value;
  }

  set config(config: any) {
    this.$emit('input', config);
  }

  get changed(): boolean {
    const state = toShadow(this.config, this.inputMapping);
    return JSON.stringify(state) !== JSON.stringify(this.inputValues);
  }

  @Watch('config', { immediate: true, deep: true })
  onBlockUpdate() {
    this.inputValues = deepCopy(toShadow(this.config, this.inputMapping));
  }

  cancelChanges() {
    this.inputValues = deepCopy(toShadow(this.config, this.inputMapping));
  }

  confirmChanges() {
    this.config = fromShadow(
      this.inputValues,
      this.inputMapping,
      { ...this.config },
    );
    Notify.create({
      type: 'positive',
      position: 'bottom',
      message: 'Saved changes',
    });
  }
}
