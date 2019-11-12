<script lang="ts">
import { Component, Emit, Prop } from 'vue-property-decorator';

import FieldBase from '@/components/FieldBase';
import { createDialog } from '@/helpers/dialog';

@Component
export default class ColorField extends FieldBase {

  @Prop({ type: String, required: false })
  public readonly value!: string | null;

  @Prop({ type: Boolean, default: false })
  public readonly clearable!: boolean;

  @Prop({ type: String, default: '<not set>' })
  public readonly nullText!: string;

  @Emit('input')
  public change(v: string | null): string | null {
    return v === null
      ? v
      : v.replace('#', '');
  }

  get color(): string {
    const color = this.value || '#ffffff';
    return color.startsWith('#') ? color : `#${color}`;
  }

  get colorString(): string {
    return this.value || this.nullText;
  }

  get colorStyle(): Mapped<any> {
    return {
      color: this.color,
      backgroundColor: this.value ? this.color : null,
      border: `1px ${this.value ? 'solid' : 'dashed'} ${this.color}`,
      borderRadius: '50%',
      height: '1em',
      width: '1em',
      display: 'inline-block',
      marginStart: '0.5em',
    };
  }

  openDialog(): void {
    if (this.readonly) {
      return;
    }

    createDialog({
      component: 'ColorDialog',
      title: this.title,
      message: this.message,
      messageHtml: this.messageHtml,
      parent: this,
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