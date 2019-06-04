import Vue from 'vue';
import { Component } from 'vue-property-decorator';

import { FlowPart } from '../types';

@Component({
  props: {
    value: {
      type: Object,
      required: true,
    },
  },
})
export default class PartCard extends Vue {
  protected get part(): FlowPart {
    return this.$props.value;
  }

  protected savePart(part: FlowPart = this.part): void {
    this.$emit('input', part);
  }

  protected savePartState(part: FlowPart = this.part): void {
    this.$emit('state', part);
  }

  protected removePart(): void {
    this.$emit('remove', this.part);
  }
}
