<script lang="ts">
import { Component, Prop } from 'vue-property-decorator';

import FieldBase from '@/components/FieldBase';
import { bloxQty } from '@/helpers/bloxfield';
import { createDialog } from '@/helpers/dialog';
import { durationString } from '@/helpers/duration';
import { Quantity } from '@/plugins/spark/types';

@Component
export default class DurationStringField extends FieldBase {

  @Prop({ type: String })
  public readonly value!: string;

  @Prop({ type: String, default: 'value' })
  public readonly label!: string;

  @Prop({ type: Array, default: () => [] })
  public readonly rules!: InputRule[];

  public change(v: string): void {
    this.$emit('input', v);
  }

  get displayValue(): string | number {
    return durationString(this.value, '<not set>');
  }

  openDialog(): void {
    if (this.readonly) {
      return;
    }

    createDialog({
      component: 'DurationQuantityDialog',
      title: this.title,
      message: this.message,
      html: this.html,
      parent: this,
      value: bloxQty(this.value),
      label: this.label,
      rules: this.rules,
    })
      .onOk((q: Quantity) => this.change(durationString(q)));
  }
}
</script>

<template>
  <LabeledField v-bind="{...$attrs, ...$props}" @click="openDialog">
    <slot name="value">
      {{ displayValue }}
    </slot>
  </LabeledField>
</template>
