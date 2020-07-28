<script lang="ts">
import { Component, Emit, Prop } from 'vue-property-decorator';

import FieldBase from '@/components/FieldBase';
import { createDialog } from '@/helpers/dialog';
import { prettify, Qty } from '@/plugins/spark/bloxfield';

@Component
export default class InlineUnitField extends FieldBase {
  prettify = prettify;

  @Prop({ type: Object, required: true, validator: v => v instanceof Qty })
  public readonly value!: Qty;

  @Prop({ type: String, required: false })
  public readonly label!: string;

  @Prop({ type: Number, default: 2 })
  readonly decimals!: number;

  @Prop({ type: String, default: 'small' })
  public readonly unitTag!: string;

  @Emit('input')
  public change(v: Qty): Qty {
    return v;
  }

  openDialog(): void {
    if (this.readonly) {
      return;
    }
    createDialog({
      component: 'UnitDialog',
      title: this.title,
      message: this.message,
      html: this.html,
      parent: this,
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
    {{ value | qty }}
  </span>
</template>
