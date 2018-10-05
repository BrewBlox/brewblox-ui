import Vue from 'vue';
import Component from 'vue-class-component';
import { Watch } from 'vue-property-decorator';
import { toShadow, fromShadow, ShadowMapping } from '@/helpers/shadow-copy';
import { HistoryOptions } from '@/plugins/history/state';

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

  get options(): HistoryOptions {
    return this.$props.value as HistoryOptions;
  }

  set options(options: HistoryOptions) {
    this.$emit('input', options);
  }

  get changed(): boolean {
    const state = toShadow(this.options, this.inputMapping);
    return Object.keys(state)
      .some(key => state[key] !== this.inputValues[key]);
  }

  @Watch('options', { immediate: true, deep: true })
  onBlockUpdate() {
    this.inputValues = toShadow(this.options, this.inputMapping);
  }

  cancelChanges() {
    this.inputValues = toShadow(this.options, this.inputMapping);
  }

  confirmChanges() {
    this.options = fromShadow(
      this.inputValues,
      this.inputMapping,
      { ...this.options },
    ) as HistoryOptions;
  }
}
