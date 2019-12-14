<script lang="ts">
import { Component, Emit, Prop } from 'vue-property-decorator';

import FieldBase from '@/components/FieldBase';
import { createDialog } from '@/helpers/dialog';
import { round } from '@/helpers/functional';


@Component
export default class InputField extends FieldBase {

  @Prop({ type: [String, Number] })
  public readonly value!: string | number;

  @Prop({ type: String, default: 'text' })
  public readonly type!: string;

  @Prop({ type: Number, default: 2 })
  readonly decimals!: number;

  @Prop({ type: Boolean, default: true })
  public readonly clearable!: boolean;

  @Emit('input')
  public change(v: string | number): string | number {
    return v;
  }

  get displayValue(): string | number {
    if (this.value === ''
      || this.value === null
      || this.value === undefined) {
      return '<not set>';
    }

    return this.type === 'number'
      ? round(this.value, this.decimals)
      : this.value;
  }

  openDialog(): void {
    if (this.readonly) {
      return;
    }

    createDialog({
      component: 'InputDialog',
      title: this.title,
      message: this.message,
      html: this.html,
      parent: this,
      value: this.value,
      decimals: this.decimals,
      type: this.type,
      label: this.label,
      rules: this.rules,
      clearable: this.clearable,
    })
      .onOk(this.change);
  }
}
</script>

<template>
  <LabeledField v-bind="{...$attrs, ...$props}" @click="openDialog">
    <template v-if="!!$scopedSlots.before" #before>
      <slot name="before" />
    </template>
    <slot name="value">
      {{ displayValue }}
    </slot>
  </LabeledField>
</template>
