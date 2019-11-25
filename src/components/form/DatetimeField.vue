<script lang="ts">
import { Component, Emit, Prop } from 'vue-property-decorator';

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

  @Prop({ type: String, default: 'date and time' })
  public readonly label!: string;

  @Prop({ type: String, default: '<not set>' })
  readonly clearLabel!: string;

  @Prop({ type: Boolean, default: false })
  public readonly defaultNow!: boolean;

  @Emit('input')
  public change(v: Date | null): Date | null {
    return v;
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
      parent: this,
      title: this.title,
      message: this.message,
      html: this.html,
      value: new Date(this.value || (this.defaultNow ? new Date().getTime() : 0)),
      label: this.label,
      resetIcon: this.resetIcon,
      rules: this.rules,
    })
      .onOk(this.change);
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
