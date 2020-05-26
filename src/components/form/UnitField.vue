<script lang="ts">
import { Component, Emit, Prop } from 'vue-property-decorator';

import FieldBase from '@/components/FieldBase';
import { createDialog } from '@/helpers/dialog';
import { prettify, Unit } from '@/plugins/spark/units';

@Component
export default class UnitField extends FieldBase {
  prettify = prettify;

  @Prop({ type: Object, required: true, validator: v => v instanceof Unit })
  public readonly value!: Unit;

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
  public change(v: Unit): Unit {
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
  <LabeledField v-bind="{...$attrs, ...$props}" @click="openDialog">
    <slot name="value">
      {{ value.value | round }}
    </slot>
    <component :is="unitTag" v-if="value.value !== null" class="self-end darkish">
      {{ value.notation }}
    </component>
    <template v-if="!!$scopedSlots.append" #append>
      <slot name="append" />
    </template>
    <template v-if="!!$scopedSlots.after" #after>
      <slot name="after" />
    </template>
  </LabeledField>
</template>
