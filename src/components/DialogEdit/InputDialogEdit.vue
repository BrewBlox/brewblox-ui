<script lang="ts">
import { Dialog } from 'quasar';
import { Component, Emit, Prop } from 'vue-property-decorator';

import DialogEditBase from './DialogEditBase';

const INPUT_TYPES = [
  'text',
  'number',
];

@Component
export default class InputDialogEdit extends DialogEditBase {

  @Prop({ type: String, required: true })
  public readonly value!: string;

  @Prop({ type: String, default: 'text', validator: v => INPUT_TYPES.includes(v) })
  public readonly type!: string;

  @Emit('input')
  public change(v: string) {
    return v;
  }

  openDialog() {
    let model = this.value;
    Dialog.create({
      title: this.title,
      message: this.message,
      dark: true,
      cancel: true,
      ...this.dialogProps,
      prompt: {
        model,
        type: this.type,
      },
    })
      .onOk(this.change);
  }
}
</script>

<template>
  <component :is="tag" v-bind="tagProps" :class="tagClass" class="editable" @click="openDialog">
    <slot name="pre"/>
    <slot name="value">{{ value }}</slot>
    <slot/>
  </component>
</template>
