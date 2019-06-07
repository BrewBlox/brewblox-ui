<script lang="ts">
import { Dialog } from 'quasar';
import { Component, Emit, Prop } from 'vue-property-decorator';

import FieldBase from './FieldBase';

@Component
export default class DatetimeField extends FieldBase {

  @Prop({ type: [Number, String, Object], required: true })
  public readonly value!: number | string | Date;

  @Prop({ type: Boolean, default: false })
  readonly short!: boolean;

  @Prop({ type: String })
  readonly resetIcon!: string;

  @Prop({ type: String, default: '<not set>' })
  readonly clearLabel!: string;

  @Emit('input')
  public change(v: Date) {
    return v;
  }

  get dateString() {
    if (!this.value) {
      return this.clearLabel;
    }
    const date = new Date(this.value);
    return this.short
      ? date.toLocaleDateString()
      : date.toLocaleString();
  }

  openDialog() {
    if (this.readonly) {
      return;
    }

    Dialog.create({
      component: 'DatetimeDialog',
      title: this.title,
      message: this.message,
      messageHtml: this.messageHtml,
      root: this.$root,
      value: new Date(this.value),
      resetIcon: this.resetIcon,
    })
      .onOk(this.change);
  }
}
</script>

<template>
  <component
    :is="tag"
    v-bind="tagProps"
    :class="[{editable: !readonly},tagClass]"
    @click="openDialog"
  >
    <slot name="pre"/>
    <slot name="value">{{ dateString }}</slot>
    <slot/>
  </component>
</template>
