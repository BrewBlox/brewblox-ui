<script lang="ts">
import { Component, Prop } from 'vue-property-decorator';

import { isLink, Link } from '@/helpers/bloxfield';
import { createBlockDialog, createDialog } from '@/helpers/dialog';
import { sparkStore } from '@/plugins/spark/store';
import type { Block } from '@/plugins/spark/types';

import FieldBase from '../FieldBase';


@Component
export default class LinkField extends FieldBase {

  @Prop({ type: Object, required: true, validator: v => isLink(v) })
  public readonly value!: Link;

  @Prop({ type: String, required: false })
  public readonly serviceId!: string | null;

  @Prop({ type: String, default: 'Choose block' })
  public readonly title!: string;

  @Prop({ type: String, default: 'Block' })
  public readonly label!: string;

  @Prop({ type: Array, required: false })
  readonly compatible!: string[];

  @Prop({ type: Function })
  public readonly blockFilter!: ((block: Block) => boolean);

  @Prop({ type: Boolean, default: true })
  public readonly clearable!: boolean;

  @Prop({ type: Boolean, default: true })
  public readonly creatable!: boolean;

  @Prop({ type: Boolean, default: true })
  public readonly configurable!: boolean;

  @Prop({ type: Boolean, default: true })
  public readonly show!: boolean;

  save(val: Link): void {
    this.$emit('input', val);
  }

  get displayValue(): string {
    return this.value.id ?? 'click to assign';
  }

  get block(): Block | null {
    return sparkStore.blockById(this.serviceId, this.value.id);
  }

  get canEdit(): boolean {
    return this.block !== null
      && this.configurable
      && this.show;
  }

  editBlock(): void {
    createBlockDialog(this.block);
  }

  openDialog(): void {
    if (this.readonly) {
      return;
    }

    createDialog({
      component: 'LinkDialog',
      title: this.title,
      message: this.message,
      html: this.html,
      value: this.value,
      label: this.label,
      serviceId: this.serviceId,
      compatible: this.compatible,
      blockFilter: this.blockFilter,
      clearable: this.clearable,
      creatable: this.creatable,
      configurable: this.configurable,
      ...this.dialogProps,
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
      <q-btn
        v-if="canEdit"
        flat
        round
        icon="mdi-launch"
        @click.stop="editBlock"
      >
        <q-tooltip>Show {{ value.id }}</q-tooltip>
      </q-btn>
    </template>
  </LabeledField>
</template>
