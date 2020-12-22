<script lang="ts">
import { Component, Emit, Prop } from 'vue-property-decorator';

import FieldBase from '@/components/FieldBase';
import { isQuantity, Quantity } from '@/helpers/bloxfield';
import { createDialog } from '@/helpers/dialog';

@Component
export default class QuantityField extends FieldBase {

  @Prop({ type: Object, required: true, validator: isQuantity })
  public readonly value!: Quantity;

  @Prop({ type: String, required: false })
  public readonly label!: string;

  @Prop({ type: Boolean, default: false })
  public readonly noLabel!: boolean;

  @Prop({ type: [String, Object, Array], default: '' })
  public readonly tagClass!: any;

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
  <LabeledField v-bind="{...$attrs, ...$props}" @click="openDialog">
    <slot name="value">
      {{ value.value | round }}
    </slot>
    <component :is="unitTag" v-if="value.value !== null" class="self-end darkish">
      {{ value | prettyUnit }}
    </component>
    <template v-if="!!$scopedSlots.append" #append>
      <slot name="append" />
    </template>
    <template v-if="!!$scopedSlots.after" #after>
      <slot name="after" />
    </template>
  </LabeledField>
</template>
