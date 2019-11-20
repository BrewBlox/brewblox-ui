import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';

import { StepAction } from '../types';

@Component
export default class ActionBase<T = any> extends Vue {
  @Prop({ type: Object, required: true })
  public readonly action!: StepAction<T>;

  saveAction(action: StepAction<T> = this.action): void {
    this.$emit('update:action', action);
  }

  get opts(): T {
    return this.action.opts;
  }
}
