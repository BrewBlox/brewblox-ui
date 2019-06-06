<script lang="ts">
import { Dialog } from 'quasar';
import { Component, Emit, Prop } from 'vue-property-decorator';

import DialogEditBase from './DialogEditBase';

@Component
export default class DatetimeDialogEdit extends DialogEditBase {

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
    Dialog.create({
      component: 'DatetimeDialog',
      title: this.title,
      message: this.message,
      root: this.$root,
      value: new Date(this.value),
      resetIcon: this.resetIcon,
    })
      .onOk(this.change);
  }
}
</script>

<template>
  <component :is="tag" v-bind="tagProps" :class="tagClass" class="editable" @click="openDialog">
    <slot name="pre"/>
    <slot name="value">{{ dateString }}</slot>
    <slot/>
  </component>
</template>
