<script lang="ts">
import { Dialog } from 'quasar';
import { Component, Emit, Prop } from 'vue-property-decorator';

import { round } from '@/helpers/functional';

import FieldBase from './FieldBase';


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

  @Emit('input')
  public change(v: number) {
    return v;
  }

  get displayValue() {
    return round(this.value, this.decimals);
  }

  openDialog() {
    if (this.readonly) {
      return;
    }

    Dialog.create({
      component: 'SliderDialog',
      title: this.title,
      message: this.message,
      messageHtml: this.messageHtml,
      root: this.$root,
      value: this.value,
      decimals: this.decimals,
      min: this.min,
      max: this.max,
      step: this.step,
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
