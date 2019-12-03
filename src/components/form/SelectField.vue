<script lang="ts">
import { Component, Emit, Prop } from 'vue-property-decorator';

import FieldBase from '@/components/FieldBase';
import { createDialog } from '@/helpers/dialog';

@Component
export default class SelectField extends FieldBase {

  @Prop({ type: [String, Number, Array, Object], required: true })
  public readonly value!: any;

  @Prop({ type: Array, required: true })
  public readonly options!: any[];

  @Prop({ type: String, default: 'value' })
  public readonly label!: string;

  @Prop({ type: String, default: 'label' })
  public readonly optionsLabel!: string;

  @Prop({ type: String, default: 'value' })
  public readonly optionsValue!: string;

  @Prop({ type: Boolean, default: false })
  public readonly clearable!: boolean;

  @Prop({ type: Object, default: () => ({}) })
  public readonly selectProps!: any;

  get displayValue(): string {
    if (this.selectProps.multiple) {
      const text = this.value
        .map((v: any) => this.options.find((opt: any) => opt[this.optionsValue] === v))
        .map((v: any) => v[this.optionsLabel])
        .join(', ');
      return text || 'Click to set';
    }

    const selected = this.options
      .find((opt: any) => opt[this.optionsValue] === this.value)
      || { [this.optionsLabel]: 'Click to set' };
    return selected[this.optionsLabel];
  }

  @Emit('input')
  public change(v: any): any {
    return v;
  }

  openDialog(): void {
    if (this.readonly) {
      return;
    }

    createDialog({
      component: 'SelectDialog',
      title: this.title,
      message: this.message,
      html: this.html,
      parent: this,
      value: this.value,
      selectOptions: this.options,
      selectProps: {
        label: this.label,
        emitValue: true,
        mapOptions: true,
        optionsLabel: this.optionsLabel,
        optionsValue: this.optionsValue,
        clearable: this.clearable,
      },
    })
      .onOk(this.change);
  }
}
</script>

<template>
  <LabeledField v-bind="{...$attrs, ...$props}" @click="openDialog">
    <slot name="value">
      {{ displayValue }}
    </slot>
  </LabeledField>
</template>
