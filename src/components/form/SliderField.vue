<script lang="ts">
import { Component, Emit, Prop } from 'vue-property-decorator';

import FieldBase from '@/components/FieldBase';
import { createDialog } from '@/helpers/dialog';
import { round } from '@/helpers/functional';


@Component
export default class SliderField extends FieldBase {

  @Prop({ type: Number })
  public readonly value!: number;

  @Prop({ type: String, default: 'value' })
  public readonly label!: string;

  @Prop({ type: Number, default: 0 })
  public readonly min!: number;

  @Prop({ type: Number, default: 100 })
  public readonly max!: number;

  @Prop({ type: Number, default: 1 })
  public readonly step!: number;

  @Prop({ type: Number, default: 2 })
  readonly decimals!: number;

  @Prop({ type: Array, default: () => [] })
  public readonly quickActions!: SelectOption[];

  @Emit('input')
  public change(v: number): number {
    return v;
  }

  get displayValue(): string | number {
    return round(this.value, this.decimals);
  }

  openDialog(): void {
    if (this.readonly) {
      return;
    }

    createDialog({
      component: 'SliderDialog',
      title: this.title,
      message: this.message,
      messageHtml: this.messageHtml,
      parent: this,
      value: this.value,
      decimals: this.decimals,
      min: this.min,
      max: this.max,
      step: this.step,
      quickActions: this.quickActions,
    })
      .onOk(this.change);
  }
}
</script>

<template>
  <component
    :is="tag"
    v-bind="tagProps"
    :class="[{editable: !readonly}, tagClass]"
    @click="openDialog"
  >
    <slot name="pre" />
    <slot name="value">
      {{ displayValue }}
    </slot>
    <slot name="append" />
    <q-tooltip v-if="!readonly">
      Set {{ label }}
    </q-tooltip>
  </component>
</template>
