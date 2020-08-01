<script lang="ts">
import { Component, Prop } from 'vue-property-decorator';

import DialogBase from '@/components/DialogBase';
import { bloxLink, JSLink, Link } from '@/helpers/bloxfield';
import { createDialog } from '@/helpers/dialog';
import { createBlockDialog } from '@/helpers/dialog';
import { objectStringSorter } from '@/helpers/functional';
import { isCompatible } from '@/plugins/spark/helpers';
import { sparkStore } from '@/plugins/spark/store';
import { Block, BlockOrIntfType } from '@/plugins/spark/types';
import { featureStore } from '@/store/features';

@Component
export default class LinkDialog extends DialogBase {
  local: JSLink | null = null

  @Prop({ type: Object })
  public readonly value!: Link;

  @Prop({ type: String, required: true })
  readonly serviceId!: string;

  @Prop({ type: String, default: 'Link' })
  public readonly label!: string;

  @Prop({ type: Array, required: false })
  readonly compatible!: BlockOrIntfType[];

  @Prop({ type: Boolean, default: true })
  public readonly clearable!: boolean;

  @Prop({ type: Boolean, default: true })
  public readonly creatable!: boolean;

  @Prop({ type: Boolean, default: true })
  public readonly configurable!: boolean;

  created(): void {
    this.local = bloxLink(this.value);
  }

  get typeFilter(): ((type: BlockOrIntfType) => boolean) {
    return type => isCompatible(type, this.compatible ?? this.value.type);
  }

  get linkOpts(): Link[] {
    return sparkStore.serviceBlocks(this.serviceId)
      .filter(block => this.typeFilter(block.type))
      .map(block => bloxLink(block.id, block.type))
      .sort(objectStringSorter('id'));
  }

  get block(): Block | null {
    return this.local
      ? sparkStore.blockById(this.serviceId, this.local.id)
      : null;
  }

  get tooltip(): string | null {
    return this.block
      ? featureStore.widgetTitle(this.block.type)
      : null;
  }

  get localOk(): boolean {
    return this.block !== null || this.clearable;
  }

  update(link: Link | null): void {
    this.local = link !== null
      ? bloxLink(link)
      : bloxLink(null, this.value.type);
  }

  configureBlock(): void {
    createBlockDialog(this.block);
  }

  createBlock(): void {
    createDialog({
      component: 'BlockWizardDialog',
      parent: this,
      serviceId: this.serviceId,
      filter: this.typeFilter,
    })
      .onOk((block: Block) => {
        // Retain original type
        this.local = bloxLink(block.id, this.value.type);
      });
  }

  save(): void {
    if (this.localOk) {
      this.onDialogOk(this.local);
    }
  }
}
</script>

<template>
  <q-dialog
    ref="dialog"
    no-backdrop-dismiss
    @hide="onDialogHide"
    @keyup.enter="save"
  >
    <DialogCard v-bind="{title, message, html}">
      <q-select
        :value="local"
        :options="linkOpts"
        :clearable="clearable"
        :label="label"
        option-label="id"
        option-value="id"
        autofocus
        item-aligned
        @input="update"
        @keyup.enter.exact.stop
      >
        <q-tooltip v-if="tooltip">
          {{ tooltip }}
        </q-tooltip>
        <template #no-option>
          <q-item>
            <q-item-section class="text-grey">
              No results
            </q-item-section>
          </q-item>
        </template>
        <template #after>
          <q-btn
            v-if="configurable && block"
            flat
            round
            icon="mdi-launch"
            @click="configureBlock"
          >
            <q-tooltip>Edit {{ local.id }}</q-tooltip>
          </q-btn>
          <q-btn
            v-else
            flat
            round
            icon="mdi-launch"
            disable
          />

          <q-btn
            v-if="creatable"
            flat
            round
            icon="add"
            @click="createBlock"
          >
            <q-tooltip>Create new Block</q-tooltip>
          </q-btn>
        </template>
      </q-select>
      <template #actions>
        <q-btn
          flat
          label="Cancel"
          color="primary"
          @click="onDialogCancel"
        />
        <q-btn
          :disable="!localOk"
          flat
          label="OK"
          color="primary"
          @click="save"
        />
      </template>
    </DialogCard>
  </q-dialog>
</template>
