<script lang="ts">
import { Component, Prop, Watch } from 'vue-property-decorator';

import { createBlockDialog, createDialog } from '@/helpers/dialog';
import { blockIdRules, discoverBlocks } from '@/plugins/spark/helpers';
import { SparkServiceModule, sparkStore } from '@/plugins/spark/store';
import type { Block, BlockConfig } from '@/plugins/spark/types';
import { tryCreateWidget } from '@/plugins/wizardry';
import WidgetWizardBase from '@/plugins/wizardry/WidgetWizardBase';


@Component
export default class BlockDiscoveryWizard extends WidgetWizardBase {
  dashboardId: string | null = null;
  sparkModule: SparkServiceModule | null = null;
  block: Block | null = null;
  busy = false;

  @Prop({ type: String })
  public readonly activeServiceId!: string | null;

  @Prop({ type: Boolean, default: false })
  public readonly optionalWidget!: boolean;

  @Watch('sparkModule')
  watchModule(newV: SparkServiceModule, oldV: SparkServiceModule): void {
    if (newV?.id !== oldV?.id) {
      this.block = null;
    }
  }

  mounted(): void {
    this.setDialogTitle(`${this.featureTitle} wizard`);
    this.sparkModule = sparkStore.moduleById(this.activeServiceId)
      ?? sparkStore.modules[0]
      ?? null;
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

  async discover(): Promise<void> {
    this.busy = true;
    await discoverBlocks(this.activeServiceId)
      .finally(() => this.busy = false);
  }

  async finish(): Promise<void> {
    if (!this.block) { return; }

    if (this.dashboardId) {
      const widget = await tryCreateWidget<BlockConfig>({
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
      this.done({ widget, block: this.block });
    }
    else if (this.optionalWidget) {
      this.done({ block: this.block });
    }
  }
}
</script>

<template>
  <ActionCardBody>
    <div class="widget-body column">
      <DashboardSelect
        v-model="dashboardId"
        :default-value="activeDashboardId"
        :label="optionalWidget
          ? 'Show on dashboard (optional)'
          : 'Dashboard'"
        :clearable="optionalWidget"
      />

      <q-select
        v-if="moduleOpts.length > 1"
        v-model="sparkModule"
        :options="moduleOpts"
        label="Service"
        emit-value
        map-options
      />

      <CardWarning v-if="moduleOpts.length === 0">
        <template #message>
          There are no Spark services available
        </template>
      </CardWarning>
      <div v-else class="q-pa-sm q-mt-md">
        {{ featureTitle }} blocks are linked to hardware, and must be discovered. <br>
        If a block is not shown below, please ensure it is plugged in, and click Discover.
      </div>

      <ListSelect
        v-model="block"
        :options="blockOpts"
        option-value="id"
        option-label="id"
        dense
        @confirm="v => { block = v; createWidget(); }"
      >
        <template #body="{ opt }">
          <div class="row">
            <div class="col-grow self-center">
              {{ opt.id }}
            </div>
            <q-btn
              flat
              icon="edit"
              @click.stop="startChangeBlockId(opt)"
            >
              <q-tooltip>Rename block</q-tooltip>
            </q-btn>
            <q-btn
              flat
              icon="mdi-launch"
              @click.stop="showBlock(opt)"
            >
              <q-tooltip>Edit block</q-tooltip>
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
        v-if="optionalWidget"
        :disable="!block"
        unelevated
        label="Done"
        color="primary"
        @click="finish"
      />
      <q-btn
        v-else
        :disable="!block || !dashboardId"
        unelevated
        label="Create widget"
        color="primary"
        @click="finish"
      />
    </template>
  </ActionCardBody>
</template>
