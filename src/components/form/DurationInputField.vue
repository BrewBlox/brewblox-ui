<script lang="ts">
import { Component, Prop } from 'vue-property-decorator';

import FieldBase from '@/components/FieldBase';
import { createDialog } from '@/helpers/dialog';
import { durationMs, durationString, unitDurationString } from '@/helpers/functional';
import { Unit } from '@/helpers/units';


@Component
export default class DurationInputField extends FieldBase {

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
    if (this.value === ''
      || this.value === null
      || this.value === undefined) {
      return '<not set>';
    }

    return durationString(this.value);
  }

  openDialog(): void {
    if (this.readonly) {
      return;
    }

    createDialog({
      component: 'TimeUnitDialog',
      title: this.title,
      message: this.message,
      messageHtml: this.messageHtml,
      parent: this,
      value: new Unit(durationMs(this.value), 'ms'),
      label: this.label,
      rules: this.rules,
    })
      .onOk(unit => this.change(unitDurationString(unit)));
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
