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
    return v?.replace('#', '') ?? null;
  }

  get color(): string {
    const color = this.value || '#ffffff';
    return color.startsWith('#') ? color : `#${color}`;
  }

  get colorString(): string {
    return !!this.value
      ? this.color
      : this.nullText;
  }

  get colorStyle(): Mapped<any> {
    return {
      color: this.color,
      backgroundColor: this.value ? this.color : null,
      border: `1px ${this.value ? 'solid' : 'dashed'} ${this.color}`,
      borderRadius: '50%',
      height: '20px',
      width: '20px',
      display: 'inline-block',
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
      html: this.html,
      parent: this,
      value: this.color,
      clearable: this.clearable,
    })
      .onOk(this.change);
  }
}
</script>

<template>
  <LabeledField v-bind="{...$attrs, ...$props}" @click="openDialog">
    <slot name="value">
      {{ colorString }}
    </slot>
    <template #after>
      <slot name="indicator">
        <span class="self-end q-mb-sm" :style="colorStyle" />
      </slot>
    </template>
  </LabeledField>
</template>
