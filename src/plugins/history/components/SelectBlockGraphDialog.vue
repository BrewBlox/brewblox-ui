<script lang="ts">
import mapValues from 'lodash/mapValues';
import { uid } from 'quasar';
import { Component, Prop } from 'vue-property-decorator';

import DialogBase from '@/components/DialogBase';
import { createBlockDialog } from '@/helpers/dialog';
import { blockGraphCfg } from '@/plugins/spark/helpers';
import { sparkStore } from '@/plugins/spark/store';
import { Block, BlockCrud, BlockField, BlockType, SparkService } from '@/plugins/spark/types';

import { GraphConfig } from '../types';


@Component
export default class SelectBlockGraphDialog extends DialogBase {
  service: SparkService | null = null;
  block: Block | null = null;
  selectedFields: BlockField[] = [];

  @Prop({ type: String, default: 'Add block to graph' })
  public readonly title!: string;

  created(): void {
    this.service = this.services[0] ?? null;
  }

  get services(): SparkService[] {
    return sparkStore.modules.map(m => m.service);
  }

  get graphedTypes(): BlockType[] {
    return sparkStore
      .specs
      .filter(s => s.fields.some(f => f.graphed))
      .map(s => s.id);
  }

  get blocks(): Block[] {
    return sparkStore
      .serviceBlocks(this.service?.id ?? null)
      .filter(block => this.graphedTypes.includes(block.type));
  }

  get fields(): BlockField[] {
    return this.block
      ? sparkStore.spec(this.block)
        .fields
        .filter(f => f.graphed)
      : [];
  }

  selectService(svc: SparkService | null): void {
    if (svc?.id !== this.service?.id) {
      this.selectBlock(null);
    }
    this.service = svc;
  }

  selectBlock(block: Block | null): void {
    if (block?.id !== this.block?.id) {
      this.selectedFields = [];
    }
    this.block = block;
  }

  showBlock(block: Block): void {
    createBlockDialog(block);
  }

  save(): void {
    if (!this.block || !this.selectedFields.length) {
      return;
    }
    const blockId = this.block.id;
    const crud: BlockCrud = {
      isStoreBlock: true,
      isStoreWidget: false,
      saveWidget: () => { },
      saveBlock: block => sparkStore.saveBlock(block),
      closeDialog: () => { },
      block: this.block,
      widget: {
        id: uid(),
        title: blockId,
        feature: this.block.type,
        dashboard: '',
        cols: 1,
        rows: 1,
        order: 0,
        config: {
          serviceId: this.block.serviceId,
          blockId: blockId,
        },
      },
    };
    const cfg = blockGraphCfg(crud, v => this.selectedFields.some(f => f.key === v.key));
    const sanitized: GraphConfig = {
      ...cfg,
      layout: {},
      params: {},
      renames: mapValues(cfg.renames, v => `[${blockId}] ${v}`),
    };
    this.onDialogOk(sanitized);
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
      <div class="q-pa-sm q-gutter-md">
        <div
          v-if="services.length === 0"
          class="text-italic fade-2"
        >
          No Spark services found
        </div>
        <ListSelect
          :value="service"
          :options="services"
          option-value="id"
          option-label="title"
          @input="selectService"
          @confirm="selectService"
        />
        <q-select
          :value="block"
          :disable="!service"
          :options="blocks"
          label="Block"
          option-label="id"
          option-value="id"
          @input="selectBlock"
          @keyup.enter.exact.stop
        >
          <template #no-option>
            <q-item>
              <q-item-section class="text-grey">
                No results
              </q-item-section>
            </q-item>
          </template>
          <template #after>
            <q-btn
              :disable="!block"
              flat
              dense
              icon="mdi-launch"
              class="self-end"
              @click.stop="showBlock(block)"
            >
              <q-tooltip>Show block</q-tooltip>
            </q-btn>
          </template>
        </q-select>
        <ListMultiSelect
          v-model="selectedFields"
          :options="fields"
          option-value="key"
          option-label="title"
        />
      </div>
      <template #actions>
        <q-btn
          flat
          label="Cancel"
          color="primary"
          @click="onDialogCancel"
        />
        <q-btn
          :disable="!block || !selectedFields.length"
          flat
          label="OK"
          color="primary"
          @click="save"
        />
      </template>
    </DialogCard>
  </q-dialog>
</template>
