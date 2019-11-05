<script lang="ts">
import { Component, Emit, Prop } from 'vue-property-decorator';

import { createDialog } from '@/helpers/dialog';
import { dateString, shortDateString } from '@/helpers/functional';

import FieldBase from './FieldBase';

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

  get displayString(): string {
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
      messageHtml: this.messageHtml,
      parent: this,
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
  <component
    :is="tag"
    v-bind="tagProps"
    :class="[{ editable: !readonly }, tagClass]"
    @click="openDialog"
  >
    <slot name="pre" />
    <slot name="value">
      {{ displayString }}
    </slot>
    <slot />
    <q-tooltip v-if="!readonly">
      Set {{ label }}
    </q-tooltip>
  </component>
</template>
