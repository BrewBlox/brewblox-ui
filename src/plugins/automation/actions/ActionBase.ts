import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';

import { ActionImpl, AutomationAction } from '../types';

@Component
export default class ActionBase<T extends ActionImpl = ActionImpl> extends Vue {
  @Prop({ type: Object, required: true })
  public readonly action!: AutomationAction<T>;

  public saveAction(action: AutomationAction<T> = this.action): void {
    this.$emit('update:action', action);
  }

  public get impl(): T {
    return this.action.impl;
  }
}
