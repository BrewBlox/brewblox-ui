<script lang="ts">
import { Component, Prop } from 'vue-property-decorator';

import { createBlockDialog, createDialog } from '@/helpers/dialog';
import { sparkStore } from '@/plugins/spark/store';
import type { Block, ComparedBlockType } from '@/plugins/spark/types';
import type { BlockAddress } from '@/plugins/spark/types';

import FieldBase from '../FieldBase';


@Component
export default class BlockAddressField extends FieldBase {

  @Prop({ type: Object, required: true })
  public readonly value!: BlockAddress;

  @Prop({ type: String, default: 'Choose block' })
  public readonly title!: string;

  @Prop({ type: String, default: 'Block' })
  public readonly label!: string;

  @Prop({ type: Boolean, default: false })
  public readonly anyService!: boolean;

  @Prop({ type: [String, Array], required: false })
  readonly compatible!: ComparedBlockType;

  @Prop({ type: Function, required: false })
  public readonly blockFilter!: ((block: Block) => boolean);

  @Prop({ type: Boolean, default: true })
  public readonly clearable!: boolean;

  @Prop({ type: Boolean, default: true })
  public readonly creatable!: boolean;

  @Prop({ type: Boolean, default: true })
  public readonly configurable!: boolean;

  @Prop({ type: Boolean, default: true })
  public readonly show!: boolean;

  save(val: BlockAddress): void {
    this.$emit('input', val);
  }

  get displayValue(): string {
    return this.value.id ?? 'click to assign';
  }

  get block(): Block | null {
    return sparkStore.blockById(this.value.serviceId, this.value.id);
  }

  get canEdit(): boolean {
    return this.block !== null
      && this.configurable
      && this.show;
  }

  get broken(): boolean {
    return this.block === null
      && this.value.serviceId !== null
      && this.value.id !== null;
  }

  editBlock(): void {
    createBlockDialog(this.block);
  }

  openDialog(): void {
    if (this.readonly) {
      return;
    }

    createDialog({
      component: 'BlockAddressDialog',
      title: this.title,
      message: this.message,
      html: this.html,
      value: this.value,
      label: this.label,
      anyService: this.anyService,
      clearable: this.clearable,
      creatable: this.creatable,
      configurable: this.configurable,
      compatible: this.compatible,
      blockFilter: this.blockFilter,
      ...this.dialogProps,
    })
      .onOk(this.save);
  }
}
</script>

<template>
  <LabeledField v-bind="{...$attrs, ...$props}" @click="openDialog">
    {{ displayValue | truncated }}
    <q-item-label v-if="broken" caption class="text-negative q-mt-xs">
      Block {{ value.id }} not found
    </q-item-label>
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
      <q-icon
        v-if="broken"
        name="error"
        color="negative"
      />
    </template>
  </LabeledField>
</template>
