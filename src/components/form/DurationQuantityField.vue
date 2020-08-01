<script lang="ts">
import { Component, Emit, Prop } from 'vue-property-decorator';

import FieldBase from '@/components/FieldBase';
import { isQuantity } from '@/helpers/bloxfield';
import { createDialog } from '@/helpers/dialog';
import { Quantity } from '@/plugins/spark/types';

@Component
export default class DurationQuantityField extends FieldBase {

  @Prop({
    type: Object,
    required: true,
    validator: isQuantity,
  })
  public readonly value!: Quantity;

  @Prop({ type: String, default: 'duration' })
  public readonly label!: string;

  @Emit('input')
  public change(v: Quantity): Quantity {
    return v;
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
      value: this.value,
      label: this.label,
      rules: this.rules,
    })
      .onOk(this.change);
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
