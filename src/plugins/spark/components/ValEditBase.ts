import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';

import { SparkServiceModule, sparkStore } from '@/plugins/spark/store';

@Component
export default class ValEditBase<T = any> extends Vue {
  @Prop({ type: String, required: true })
  public readonly serviceId!: string;

  @Prop({ type: String, required: true })
  public readonly blockId!: string;

  @Prop({ type: Boolean, default: false })
  public readonly editable!: boolean;

  @Prop({ type: Boolean, default: true })
  public readonly dense!: boolean;

  @Prop({ type: Boolean, default: false })
  public readonly comparison!: boolean;

  @Prop({ required: true })
  public readonly value!: T;

  public saveField(val: T): void {
    this.$emit('input', val);
  }

  public startEdit(): void {
    this.$emit('edit');
  }

  public get sparkModule(): SparkServiceModule {
    return sparkStore.moduleById(this.serviceId)!;
  }

  public get field(): T {
    return this.value;
  }

  public set field(val: T) {
    this.saveField(val);
  }
}
