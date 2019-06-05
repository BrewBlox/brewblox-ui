import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';

import { FlowPart } from '../types';

@Component
export default class PartCard extends Vue {

  @Prop({ type: Object, required: true })
  protected readonly part!: FlowPart;

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
