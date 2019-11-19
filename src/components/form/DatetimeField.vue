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
  <q-field
    :label="label"
    :class="[{pointer: !readonly}, $attrs.class]"
    v-bind="$attrs"
    stack-label
    @click.native="openDialog"
  >
    <template #control>
      <component :is="tag" class="q-mt-sm">
        <slot name="value">
          {{ displayValue }}
        </slot>
      </component>
    </template>
  </q-field>
</template>
