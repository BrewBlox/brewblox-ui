<script lang="ts">
import { Component, Prop } from 'vue-property-decorator';

import { createDialog, showBlockDialog } from '@/helpers/dialog';
import { Link } from '@/helpers/units';
import { sparkStore } from '@/plugins/spark/store';
import { Block } from '@/plugins/spark/types';

import FieldBase from '../FieldBase';


@Component
export default class BlockField extends FieldBase {

  @Prop({ type: Object, required: true, validator: v => v instanceof Link })
  public readonly value!: Link;

  @Prop({ type: String, required: true })
  public readonly serviceId!: string;

  @Prop({ type: String, default: 'Choose Block' })
  public readonly title!: string;

  @Prop({ type: String, default: 'Block' })
  public readonly label!: string;

  @Prop({ type: Function, default: null })
  readonly filter!: (block: Block) => boolean;

  @Prop({ type: Boolean, default: false })
  public readonly noCreate!: boolean;

  @Prop({ type: Boolean, default: false })
  public readonly noShow!: boolean;

  @Prop({ type: Boolean, default: true })
  public readonly clearable!: boolean;

  save(val: Link): void {
    this.$emit('input', val);
  }

  get displayValue(): string {
    return this.value.id || 'click to assign';
  }

  get linkBlock(): Block | null {
    return this.value && this.value.id
      ? sparkStore.tryBlockById(this.serviceId, this.value.id)
      : null;
  }

  editBlock(): void {
    showBlockDialog(this.linkBlock);
  }

  openDialog(): void {
    if (this.readonly) {
      return;
    }

    createDialog({
      component: 'LinkDialog',
      parent: this,
      clearable: this.clearable,
      title: this.title,
      message: this.message,
      html: this.html,
      filter: this.filter,
      value: this.value,
      serviceId: this.serviceId,
      label: this.label,
      noCreate: this.noCreate,
    })
      .onOk(this.save);
  }
}
</script>

<template>
  <LabeledField v-bind="{...$attrs, ...$props}" @click="openDialog">
    <slot name="value">
      {{ displayValue | truncated }}
    </slot>
    <template #append>
      <q-btn v-if="linkBlock && !noShow" flat round icon="mdi-launch" @click.stop="editBlock">
        <q-tooltip>Show {{ value.id }}</q-tooltip>
      </q-btn>
    </template>
  </LabeledField>
</template>
