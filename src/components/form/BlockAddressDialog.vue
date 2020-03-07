<script lang="ts">
import { Component, Prop } from 'vue-property-decorator';

import DialogBase from '@/components/DialogBase';
import { createDialog } from '@/helpers/dialog';
import { createBlockDialog } from '@/helpers/dialog';
import { objectStringSorter, spaceCased } from '@/helpers/functional';
import { isCompatible } from '@/plugins/spark/block-types';
import { sparkStore } from '@/plugins/spark/store';
import { Block, BlockAddress } from '@/plugins/spark/types';
import { featureStore } from '@/store/features';

const asAddr = (v: Block | BlockAddress): BlockAddress => ({
  id: v?.id ?? null,
  serviceId: v?.serviceId,
  type: v?.type ?? null,
});


@Component
export default class BlockAddressDialog extends DialogBase {
  local: BlockAddress | null = null;

  @Prop({ type: Object, required: true })
  public readonly value!: BlockAddress;

  @Prop({ type: String, default: 'Block' })
  public readonly label!: string;

  @Prop({ type: Function, required: false })
  readonly typeFilter!: (type: string) => boolean;

  @Prop({ type: Boolean, default: false })
  public readonly anyService!: boolean;

  @Prop({ type: Boolean, default: false })
  public readonly clearable!: boolean;

  @Prop({ type: Boolean, default: false })
  public readonly noCreate!: boolean;

  @Prop({ type: Boolean, default: false })
  public readonly noConfigure!: boolean;

  created(): void {
    if (this.value.id) {
      this.local = asAddr(this.value);
    }
  }

  get serviceId(): string {
    const addr = this.local ?? this.value;
    return addr.serviceId ?? sparkStore.serviceIds[0];
  }

  set serviceId(serviceId: string) {
    if (!this.local || this.local.serviceId !== serviceId) {
      this.local = {
        id: null,
        serviceId,
        type: this.value.type,
      };
    }
  }

  get serviceIds(): string[] {
    return sparkStore.serviceIds;
  }

  get actualFilter(): ((type: string) => boolean) {
    return this.typeFilter
      ? this.typeFilter
      : type => isCompatible(type, this.value.type);
  }

  get tooltip(): string | null {
    const addr = this.local ?? this.value;
    return addr.type
      ? featureStore.widgetTitle(addr.type) ?? spaceCased(addr.type)
      : null;
  }

  get addrOpts(): SelectOption[] {
    return sparkStore.blockValues(this.serviceId)
      .filter(block => this.actualFilter(block.type))
      .map(block => ({
        value: asAddr(block),
        label: block.id,
      }))
      .sort(objectStringSorter('label'));
  }

  get localOk(): boolean {
    return this.clearable || !!this.local?.id;
  }

  configureBlock(): void {
    createBlockDialog(this.local);
  }

  createBlock(): void {
    createDialog({
      component: 'BlockWizardDialog',
      parent: this,
      serviceId: this.serviceId,
      filter: this.actualFilter,
    })
      .onOk((block: Block) => {
        this.local = asAddr(block);
      });
  }

  save(): void {
    if (!this.localOk) { return; }
    this.onDialogOk(this.local ?? {
      id: null,
      serviceId: this.serviceId,
      type: this.value.type,
    });
  }
}
</script>

<template>
  <q-dialog
    ref="dialog"
    no-backdrop-dismiss
    @hide="onDialogHide"
    @keyup.ctrl.enter="save"
  >
    <DialogCard v-bind="{title, message, html}">
      <q-select
        v-if="anyService && serviceIds.length > 1"
        v-model="serviceId"
        :options="serviceIds"
        label="Service"
        item-aligned
      />
      <q-select
        v-model="local"
        :options="addrOpts"
        :clearable="clearable"
        :label="label"
        autofocus
        item-aligned
        emit-value
        map-options
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
            v-if="!noConfigure && local && local.id"
            flat
            round
            icon="mdi-launch"
            @click="configureBlock"
          >
            <q-tooltip>Show {{ local.id }}</q-tooltip>
          </q-btn>
          <q-btn
            v-else
            flat
            round
            disable
            icon="mdi-launch"
          />

          <q-btn
            v-if="!noCreate"
            flat
            round
            icon="add"
            @click="createBlock"
          >
            <q-tooltip>Create new block</q-tooltip>
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
