<script lang="ts">
import pick from 'lodash/pick';
import { Component, Prop } from 'vue-property-decorator';

import { createBlockDialog, createDialog } from '@/helpers/dialog';
import { sparkStore } from '@/plugins/spark/store';
import { Block, BlockAddress } from '@/plugins/spark/types';

import FieldBase from '../FieldBase';


@Component
export default class BlockAddressField extends FieldBase {

  @Prop({ type: Object, required: true })
  public readonly value!: BlockAddress;

  @Prop({ type: String, default: 'Choose block' })
  public readonly title!: string;

  @Prop({ type: String, default: 'Block' })
  public readonly label!: string;

  @Prop({ type: Boolean, default: true })
  public readonly clearable!: boolean;

  @Prop({ type: Function, required: false })
  readonly typeFilter!: (type: string) => boolean;

  @Prop({ type: Boolean, default: false })
  public readonly anyService!: string;

  @Prop({ type: Boolean, default: false })
  public readonly noCreate!: boolean;

  @Prop({ type: Boolean, default: false })
  public readonly noConfigure!: boolean;

  save(val: BlockAddress): void {
    this.$emit('input', val);
  }

  get displayValue(): string {
    return this.value.id ?? 'click to assign';
  }

  get block(): Block | null {
    return sparkStore.tryBlockById(this.value.serviceId, this.value.id);
  }

  configureBlock(): void {
    createBlockDialog(this.block);
  }

  openDialog(): void {
    if (this.readonly || !this.value.serviceId) {
      return;
    }

    createDialog({
      component: 'BlockAddressDialog',
      ...pick(this, [
        'title',
        'message',
        'html',
        'value',
        'label',
        'clearable',
        'typeFilter',
        'anyService',
        'noCreate',
        'noConfigure',
      ]),
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
        v-if="!noConfigure && block"
        flat
        round
        icon="mdi-launch"
        @click.stop="configureBlock"
      >
        <q-tooltip>Show {{ value.id }}</q-tooltip>
      </q-btn>
    </template>
  </LabeledField>
</template>
