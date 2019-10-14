<script lang="ts">
import { Component, Emit, Prop } from 'vue-property-decorator';

import { createDialog } from '@/helpers/dialog';
import { round } from '@/helpers/functional';

import FieldBase from './FieldBase';


@Component
export default class InputField extends FieldBase {

  @Prop({ type: [String, Number] })
  public readonly value!: string | number;

  @Prop({ type: String, default: 'text' })
  public readonly type!: string;

  @Prop({ type: String, default: 'value' })
  public readonly label!: string;

  @Prop({ type: Number, default: 2 })
  readonly decimals!: number;

  @Prop({ type: Array, default: () => [] })
  public readonly rules!: (v: any) => true | string;

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
      messageHtml: this.messageHtml,
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
