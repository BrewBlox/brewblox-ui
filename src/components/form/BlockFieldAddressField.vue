<script lang="ts">
import { Component, Prop } from 'vue-property-decorator';

import { createDialog } from '@/helpers/dialog';
import { sparkStore } from '@/plugins/spark/store';
import { Block, BlockField, BlockFieldAddress } from '@/plugins/spark/types';

import FieldBase from '../FieldBase';


@Component
export default class BlockFieldAddressField extends FieldBase {

  @Prop({ type: Object, required: true })
  public readonly value!: BlockFieldAddress;

  @Prop({ type: String, default: 'Choose field' })
  public readonly title!: string;

  @Prop({ type: String, default: 'Block field' })
  public readonly label!: string;

  @Prop({ type: Array, required: false })
  public readonly services!: string[];

  @Prop({ type: Array, required: false })
  public readonly compatible!: string[];

  @Prop({ type: Boolean, default: true })
  public readonly clearable!: boolean;

  @Prop({ type: Boolean, default: true })
  public readonly configurable!: boolean;

  @Prop({ type: Boolean, default: true })
  public readonly show!: boolean;

  save(val: BlockFieldAddress): void {
    this.$emit('input', val);
  }

  get fieldSpec(): BlockField | null {
    return sparkStore.fieldSpec(this.value);
  }

  get block(): Block | null {
    return sparkStore.blockByAddress(this.value);
  }

  get broken(): boolean {
    return this.block === null
      && this.value.serviceId !== null
      && this.value.id !== null;
  }

  get canEdit(): boolean {
    return this.block !== null
      && this.configurable
      && this.show;
  }

  openDialog(): void {
    if (this.readonly) {
      return;
    }

    createDialog({
      component: 'BlockFieldAddressDialog',
      title: this.title,
      message: this.message,
      html: this.html,
      value: this.value,
      label: this.label,
      services: this.services,
      compatible: this.compatible,
      ...this.dialogProps,
    })
      .onOk(this.save);
  }
}
</script>

<template>
  <LabeledField v-bind="{...$attrs, ...$props}" @click="openDialog">
    <div v-if="fieldSpec" class="q-gutter-y-xs">
      <div>
        {{ value.serviceId }}
      </div>
      <div>
        {{ value.id }}
      </div>
      <div>
        {{ fieldSpec.title }}
      </div>
    </div>
    <div v-else>
      Click to assign
    </div>
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
