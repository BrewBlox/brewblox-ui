import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';

import { AutomationImpl, AutomationItem } from '../types';

@Component
export default class AutomationItemBase<T extends AutomationImpl> extends Vue {
  @Prop({ type: Object, required: true })
  public readonly item!: AutomationItem<T>;

  public save(item: AutomationItem<T> = this.item): void {
    this.$emit('update:item', item);
  }

  public get impl(): T {
    return this.item.impl;
  }

  public get enabled(): boolean {
    return this.item.enabled;
  }

  public set enabled(val: boolean) {
    this.item.enabled = val;
    this.save();
  }
}
