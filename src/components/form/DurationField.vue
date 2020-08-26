<script lang="ts">
import { Component, Prop } from 'vue-property-decorator';

import FieldBase from '@/components/FieldBase';
import { bloxQty, isQuantity } from '@/helpers/bloxfield';
import { createDialog } from '@/helpers/dialog';
import { durationString, isDurationString } from '@/helpers/duration';
import { Quantity } from '@/plugins/spark/types';

@Component
export default class DurationField extends FieldBase {

  // Duration can be:
  // - Quantity -> bloxQty(10, 'min')
  // - duration string -> '10m'
  // @input events emitted will match type of value
  // If input is undefined, type is assumed to be string
  @Prop({
    type: [Object, String],
    required: false,
    validator: v => isQuantity(v) || isDurationString(v),
  })
  public readonly value!: Quantity | string | undefined;

  @Prop({ type: String, default: 'duration' })
  public readonly label!: string;

  get isQtyValue(): boolean {
    return isQuantity(this.value);
  }

  public save(v: Quantity): void {
    const matching = this.isQtyValue
      ? v
      : durationString(v);
    this.$emit('input', matching);
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
      value: bloxQty(this.value ?? ''),
      label: this.label,
      rules: this.rules,
    })
      .onOk(this.save);
  }

  // Can't be placed in parent class
  get activeSlots(): string[] {
    return this.fieldSlots.filter(s => !!this.$slots[s]);
  }
}
</script>

<template>
  <LabeledField v-bind="{...$attrs, ...$props}" @click="openDialog">
    <slot name="value">
      {{ value | duration }}
    </slot>

    <template v-for="slot in activeSlots">
      <template :slot="slot">
        <slot :name="slot" />
      </template>
    </template>
  </LabeledField>
</template>
