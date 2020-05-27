<script lang="ts">
import { Component, Watch } from 'vue-property-decorator';

import WidgetWizardBase from '@/components/WidgetWizardBase';
import { createBlockDialog, createDialog } from '@/helpers/dialog';
import { blockIdRules } from '@/plugins/spark/helpers';
import { SparkServiceModule, sparkStore } from '@/plugins/spark/store';
import type { Block } from '@/plugins/spark/types';
import type { BlockConfig } from '@/plugins/spark/types';


@Component
export default class BlockDiscoveryWizard
  extends WidgetWizardBase<BlockConfig> {
  sparkModule: SparkServiceModule | null = null;
  block: Block | null = null;
  busy = false;

  @Watch('sparkModule')
  watchModule(newV: SparkServiceModule, oldV: SparkServiceModule): void {
    if (newV?.id !== oldV?.id) {
      this.block = null;
    }
  }

  mounted(): void {
    this.sparkModule = this.moduleOpts[0]?.value ?? null;
  }

  async discover(): Promise<void> {
    if (!this.sparkModule) { return; }
    this.busy = true;
    await this.sparkModule.fetchDiscoveredBlocks()
      .finally(() => this.busy = false);
  }

  get moduleOpts(): SelectOption[] {
    return sparkStore.modules
      .map(module => ({
        label: module.id,
        value: module,
      }));
  }

  get blockOpts(): Block[] {
    return this.sparkModule
      ?.blocks
      .filter(v => v.type === this.featureId)
      ?? [];
  }

  toggleOpt(opt: Block): void {
    this.block = this.block?.id !== opt.id
      ? opt
      : null;
  }

  showBlock(block: Block): void {
    createBlockDialog(block);
  }

  public startChangeBlockId(block: Block): void {
    const blockId = block.id;
    const serviceId = block.serviceId;
    createDialog({
      component: 'InputDialog',
      title: 'Change block name',
      message: `Choose a new name for '${blockId}'`,
      rules: blockIdRules(serviceId),
      clearable: false,
      value: blockId,
    })
      .onOk(async (newId: string) => {
        await this.sparkModule?.renameBlock([blockId, newId]);
        if (this.block?.id === blockId) {
          this.block = this.sparkModule?.blockById(newId) ?? null;
        }
      });
  }

  async createWidget(): Promise<void> {
    if (!this.block) { return; }

    this.createItem({
      id: this.widgetId,
      title: this.block.id,
      feature: this.featureId,
      dashboard: this.dashboardId,
      order: 0,
      config: {
        serviceId: this.block.serviceId,
        blockId: this.block.id,
      },
      ...this.defaultWidgetSize,
    });
  }
}
</script>

<template>
  <ActionCardBody>
    <div class="widget-body column">
      <q-select
        v-if="moduleOpts.length > 1"
        v-model="sparkModule"
        :options="moduleOpts"
        label="Service"
        item-aligned
        emit-value
        map-options
      />

      <CardWarning v-if="moduleOpts.length === 0">
        <template #message>
          There are no Spark services available
        </template>
      </CardWarning>
      <div v-else class="q-pa-sm">
        {{ featureTitle }} blocks are linked to hardware, and must be discovered. <br>
        If a block is not shown below, please ensure it is plugged in, and click Discover.
      </div>

      <ListSelect
        v-model="block"
        :options="blockOpts"
        option-value="id"
        option-label="id"
        @confirm="v => { block = v; createWidget(); }"
      >
        <template #body="{ opt }">
          <div class="row">
            <div class="col-grow self-center">
              {{ opt.id }}
            </div>
            <q-btn
              flat
              icon="mdi-launch"
              @click.stop="showBlock(opt)"
            >
              <q-tooltip>Edit block</q-tooltip>
            </q-btn>
            <q-btn
              flat
              icon="edit"
              @click.stop="startChangeBlockId(opt)"
            >
              <q-tooltip>Rename block</q-tooltip>
            </q-btn>
          </div>
        </template>
      </ListSelect>
    </div>

    <template #actions>
      <q-btn
        flat
        label="Back"
        @click="back"
      />
      <q-space />
      <q-btn
        :loading="busy"
        flat
        label="Discover"
        @click="discover"
      />
      <q-btn
        :disable="block === null"
        unelevated
        label="Create widget"
        color="primary"
        @click="createWidget"
      />
    </template>
  </ActionCardBody>
</template>
