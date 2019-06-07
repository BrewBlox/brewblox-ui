<script lang="ts">
import { Dialog } from 'quasar';
import { Component, Emit, Prop } from 'vue-property-decorator';

import FieldBase from './FieldBase';

@Component
export default class ColorField extends FieldBase {

  @Prop({ type: String, required: true })
  public readonly value!: string;

  @Emit('input')
  public change(v: string) {
    return v;
  }

  get color() {
    const color = this.value || '#ffffff';
    return color.startsWith('#') ? color : `#${color}`;
  }

  get colorString() {
    return this.value || '<not set>';
  }

  get colorStyle() {
    return {
      color: this.color,
      backgroundColor: this.color,
      borderRadius: '50%',
      height: '1em',
      width: '1em',
      display: 'inline-block',
      marginStart: '0.5em',
    };
  }

  openDialog() {
    if (this.readonly) {
      return;
    }

    Dialog.create({
      component: 'ColorDialog',
      title: this.title,
      message: this.message,
      messageHtml: this.messageHtml,
      root: this.$root,
      value: this.color,
    })
      .onOk(v => this.change(v.replace('#', '')));
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
    <slot name="value">{{ value }}</slot>
    <slot name="indicator">
      <span :style="colorStyle"/>
    </slot>
    <slot/>
  </component>
</template>
