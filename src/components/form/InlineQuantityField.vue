<script lang="ts">
import { Component, Emit, Prop } from 'vue-property-decorator';

import FieldBase from '@/components/FieldBase';
import { isQuantity } from '@/helpers/bloxfield';
import { createDialog } from '@/helpers/dialog';
import { Quantity } from '@/plugins/spark/types';

@Component
export default class InlineQuantityField extends FieldBase {

  @Prop({ type: Object, required: true, validator: isQuantity })
  public readonly value!: Quantity;

  @Prop({ type: String, required: false })
  public readonly label!: string;

  @Prop({ type: Number, default: 2 })
  readonly decimals!: number;

  @Prop({ type: String, default: 'small' })
  public readonly unitTag!: string;

  @Emit('input')
  public change(v: Quantity): Quantity {
    return v;
  }

  openDialog(): void {
    if (this.readonly) {
      return;
    }
    createDialog({
      component: 'QuantityDialog',
      title: this.title,
      message: this.message,
      html: this.html,
      value: this.value,
      label: this.label,
    })
      .onOk(this.change);
  }
}
</script>

<template>
  <span
    class="clickable q-pa-sm q-ma-xs rounded-borders text-bold"
    style="line-height: 200%"
    @click="openDialog"
  >
    {{ value | quantity }}
  </span>
</template>
