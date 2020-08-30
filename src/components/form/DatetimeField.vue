<script lang="ts">
import { Component, Prop } from 'vue-property-decorator';

import FieldBase from '@/components/FieldBase';
import { createDialog } from '@/helpers/dialog';
import { dateString, shortDateString } from '@/helpers/functional';

@Component
export default class DatetimeField extends FieldBase {

  @Prop({ type: [Number, String, Date] })
  public readonly value!: number | string | Date | null;

  @Prop({ type: Boolean, default: false })
  readonly short!: boolean;

  @Prop({ type: String })
  readonly resetIcon!: string;

  @Prop({ type: String, default: 'Date and time' })
  public readonly label!: string;

  @Prop({ type: String, default: '<not set>' })
  readonly clearLabel!: string;

  @Prop({ type: Boolean, default: false })
  public readonly defaultNow!: boolean;

  @Prop({ type: Boolean, default: false })
  public readonly emitNumber!: boolean;

  public save(v: Date): void {
    const result = this.emitNumber
      ? v.getTime()
      : v;
    this.$emit('input', result);
  }

  get displayValue(): string {
    return this.short
      ? shortDateString(this.value, this.clearLabel)
      : dateString(this.value, this.clearLabel);
  }

  openDialog(): void {
    if (this.readonly) {
      return;
    }

    createDialog({
      component: 'DatetimeDialog',
      title: this.title,
      message: this.message,
      html: this.html,
      value: new Date(this.value || (this.defaultNow ? new Date().getTime() : 0)),
      label: this.label,
      resetIcon: this.resetIcon,
      rules: this.rules,
    })
      .onOk(v => this.save(v));
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
