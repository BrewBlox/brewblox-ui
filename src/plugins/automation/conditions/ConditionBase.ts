import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';

import { AutomationCondition, ConditionImpl } from '../types';

@Component
export default class ConditionBase<T extends ConditionImpl = ConditionImpl> extends Vue {
  @Prop({ type: Object, required: true })
  public readonly condition!: AutomationCondition<T>;

  public saveCondition(condition: AutomationCondition<T> = this.condition): void {
    this.$emit('update:condition', condition);
  }

  public get impl(): T {
    return this.condition.impl;
  }
}
