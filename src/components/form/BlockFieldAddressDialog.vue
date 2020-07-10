<script lang="ts">
import { Component, Prop } from 'vue-property-decorator';

import DialogBase from '@/components/DialogBase';
import { sparkStore } from '@/plugins/spark/store';
import { Block, BlockFieldAddress, BlockOrIntfType, BlockSpec } from '@/plugins/spark/types';

import { createBlockDialog, createDialog } from '../../helpers/dialog';


@Component
export default class BlockFieldAddressDialog extends DialogBase {
  selectedLocal: string | null = null;
  expanded: string[] = [];

  serviceLocal: string | null = null;
  blockLocal: string | null = null;
  fieldLocal: string | null = null;

  validTypes: string[] = sparkStore
    .specs
    .filter(v => v.fields.length > 0)
    .map(v => v.id)

  @Prop({
    type: Object, default: (): BlockFieldAddress => ({
      serviceId: null,
      id: null,
      type: null,
      field: null,
      postfix: null,
    }),
  })
  public readonly value!: BlockFieldAddress;

  @Prop({ type: Array, required: false })
  public readonly services!: string[];

  @Prop({ type: Array, required: false })
  readonly types!: BlockOrIntfType[];

  created(): void {
    if (this.serviceOpts.length === 1) {
      this.serviceLocal = this.serviceOpts[0];
    }
  }

  get serviceOpts(): string[] {
    return this.services ?? sparkStore.serviceIds;
  }

  get serviceId(): string | null {
    return this.serviceLocal;
  }

  set serviceId(v: string | null) {
    if (v !== this.serviceLocal) {
      this.serviceLocal = v;
      this.blockLocal = null;
      this.fieldLocal = null;
    }
  }

  get blockOpts(): string[] {
    return sparkStore.moduleById(this.serviceId)
      ?.blocks
      .filter(block => this.validTypes.includes(block.type))
      .map(block => block.id)
      ?? [];
  }

  get blockId(): string | null {
    return this.blockLocal;
  }

  set blockId(v: string | null) {
    if (v !== this.blockLocal) {
      this.blockLocal = v;
      this.fieldLocal = null;
    }
  }

  get block(): Block | null {
    return sparkStore.blockById(this.serviceId, this.blockId);
  }

  get spec(): BlockSpec | null {
    return this.block
      ? sparkStore.spec(this.block)
      : null;
  }

  get fieldOpts(): SelectOption<string>[] {
    return this.spec
      ?.fields
      .map(f => ({ label: f.title, value: f.key }))
      ?? [];
  }

  get fieldId(): string | null {
    return this.fieldLocal;
  }

  set fieldId(v: string | null) {
    this.fieldLocal = v;
  }

  get local(): BlockFieldAddress | null {
    const [serviceId, id, field] = [
      this.serviceId,
      this.blockId,
      this.fieldId,
    ];
    if (!field || !this.spec) {
      return null;
    }
    return {
      serviceId,
      id,
      field,
      type: this.spec.id,
      postfix: this.spec.generate(serviceId)[field].postfix ?? null,
    };
  }

  get localOk(): boolean {
    return this.local !== null;
  }

  configureBlock(): void {
    createBlockDialog(this.block);
  }

  createBlock(): void {
    createDialog({
      component: 'BlockWizardDialog',
      serviceId: this.serviceId,
      filter: v => this.validTypes.includes(v),
    })
      .onOk((block: Block) => {
        this.serviceLocal = block.serviceId;
        this.blockLocal = block.id;
        this.fieldLocal = null;
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
        v-if="serviceOpts.length > 1"
        v-model="serviceId"
        :options="serviceOpts"
        label="Service"
        item-aligned
        @keyup.enter.exact.stop
      />
      <q-select
        v-model="blockId"
        :options="blockOpts"
        :disable="!serviceId"
        label="Block"
        item-aligned
        @keyup.enter.exact.stop
      >
        <template #after>
          <q-btn
            v-if="block"
            flat
            round
            icon="mdi-launch"
            @click="configureBlock"
          >
            <q-tooltip>Show {{ blockId }}</q-tooltip>
          </q-btn>
          <q-btn
            v-else
            flat
            round
            disable
            icon="mdi-launch"
          />

          <q-btn
            flat
            round
            icon="add"
            @click="createBlock"
          >
            <q-tooltip>Create new block</q-tooltip>
          </q-btn>
        </template>
      </q-select>

      <q-select
        v-model="fieldId"
        :options="fieldOpts"
        :disable="!blockId"
        label="Field"
        item-aligned
        map-options
        emit-value
        @keyup.enter.exact.stop
      />

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
