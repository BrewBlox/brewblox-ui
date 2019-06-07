<script lang="ts">
import { Dialog } from 'quasar';
import { Component, Emit, Prop } from 'vue-property-decorator';

import FieldBase from './FieldBase';


@Component
export default class InputField extends FieldBase {

  @Prop({ type: [String, Number], required: true })
  public readonly value!: string | number;

  @Prop({ type: String })
  public readonly type!: string;

  @Emit('input')
  public change(v: string | number) {
    return v;
  }

  openDialog() {
    if (this.readonly) {
      return;
    }

    Dialog.create({
      component: 'InputDialog',
      title: this.title,
      message: this.message,
      messageHtml: this.messageHtml,
      root: this.$root,
      value: this.value,
      type: this.type,
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
    <slot name="pre"/>
    <slot name="value">{{ value }}</slot>
    <slot/>
  </component>
</template>
