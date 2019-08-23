<script lang="ts">
import { Dialog } from 'quasar';
import { Component, Emit, Prop } from 'vue-property-decorator';

import FieldBase from './FieldBase';

@Component
export default class ColorField extends FieldBase {

  @Prop({ type: String, required: true })
  public readonly value!: string;

  @Prop({ type: Boolean, default: false })
  public readonly clearable!: boolean;

  @Emit('input')
  public change(v: string | null) {
    return v === null
      ? v
      : v.replace('#', '');
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
      backgroundColor: this.value ? this.color : null,
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
      clearable: this.clearable,
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
      {{ colorString }}
    </slot>
    <slot name="indicator">
      <span :style="colorStyle" />
    </slot>
    <slot />
    <q-tooltip v-if="!readonly">
      Choose color
    </q-tooltip>
  </component>
</template>
