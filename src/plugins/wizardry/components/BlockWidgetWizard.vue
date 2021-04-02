<script lang="ts">
import { Component } from 'vue-property-decorator';

import { createBlockDialog, createDialog } from '@/helpers/dialog';
import { objectStringSorter, ruleValidator, suggestId } from '@/helpers/functional';
import { blockIdRules } from '@/plugins/spark/helpers';
import { sparkStore } from '@/plugins/spark/store';
import { Block, BlockAddress, BlockConfig, BlockCrud, BlockType } from '@/plugins/spark/types';
import { tryCreateBlock, tryCreateWidget } from '@/plugins/wizardry';
import WidgetWizardBase from '@/plugins/wizardry/WidgetWizardBase';
import { Widget } from '@/store/dashboards';


type CreateMode = 'new' | 'existing';

@Component
export default class BlockWidgetWizard extends WidgetWizardBase {
  readonly featureId!: BlockType;

  createMode: CreateMode = 'new';
  activeDialog: any = null;

  serviceId: string | null = null;
  dashboardId: string | null = null;

  existingBlockId: string | null = null;

  localBlockId: string = '';
  localBlock: Block | null = null;

  mounted(): void {
    this.serviceId = sparkStore.serviceIds[0] ?? null;
    this.dashboardId = this.activeDashboardId ?? null;
    this.localBlockId = suggestId(this.featureTitle, this.validator);
  }

  get serviceOpts(): string[] {
    return sparkStore.serviceIds;
  }

  get blockIdRules(): InputRule[] {
    return this.serviceId
      ? blockIdRules(this.serviceId)
      : [];
  }

  get validator(): ((val: any) => boolean) {
    return ruleValidator(this.blockIdRules);
  }

  get blockOpts(): { id: string }[] {
    if (!this.serviceId) {
      return [];
    }
    return sparkStore.serviceBlocks(this.serviceId)
      .filter(block => block.type === this.featureId)
      .sort(objectStringSorter('id'));
  }

  get blockAddress(): BlockAddress {
    return {
      serviceId: this.serviceId,
      id: this.existingBlockId,
      type: this.featureId,
    };
  }

  set blockAddress(addr: BlockAddress) {
    this.existingBlockId = addr.id;
  }

  get existingBlock(): Block | null {
    return sparkStore.blockByAddress(this.blockAddress);
  }

  get createModeOpts(): SelectOption<CreateMode>[] {
    return [
      { label: 'Create new block', value: 'new' },
      { label: 'Use existing block', value: 'existing' },
    ];
  }

  get canConfigure(): boolean {
    return (this.createMode === 'new')
      ||
      (this.createMode === 'existing'
        && this.existingBlock !== null);
  }

  get canCreate(): boolean {
    if (this.dashboardId === null) {
      return false;
    }
    return (this.createMode === 'new'
      && this.validator(this.localBlockId))
      ||
      (this.createMode === 'existing'
        && this.existingBlock !== null);
  }

  showIdKeyboard(): void {
    createDialog({
      component: 'KeyboardDialog',
      value: this.localBlockId,
      rules: this.blockIdRules,
    })
      .onOk(v => this.localBlockId = v);
  }

  ensureLocalBlock(serviceId: string): { block: Block; widget: Widget } {
    const blockId = this.localBlockId;

    const block: Block = this.localBlock ?? {
      id: blockId,
      serviceId,
      type: this.featureId,
      groups: [0],
      data: sparkStore.spec({ type: this.featureId }).generate(),
    };
    const widget: Widget = {
      id: this.widgetId,
      title: blockId,
      feature: this.featureId,
      dashboard: this.dashboardId ?? '',
      order: 0,
      config: {
        blockId,
        serviceId,
      },
      ...this.defaultWidgetSize,
    };

    this.localBlock = block;
    this.localBlock.id = blockId;

    return { block, widget };
  }

  configureBlock(): void {
    if (!this.canConfigure || !this.serviceId) {
      return;
    }

    if (this.createMode === 'new') {
      const { block, widget } = this.ensureLocalBlock(this.serviceId);
      const crud: BlockCrud = {
        block,
        widget,
        isStoreWidget: false,
        saveWidget: () => { },
        isStoreBlock: false,
        saveBlock: v => { this.localBlock = v; },
        closeDialog: this.closeDialog,
      };
      this.activeDialog = createDialog({
        component: 'WidgetDialog',
        getCrud: () => crud,
        mode: 'Full',
      });
    }

    if (this.createMode === 'existing') {
      createBlockDialog(this.blockAddress);
    }
  }

  public closeDialog(): void {
    if (this.activeDialog) {
      this.activeDialog.hide();
      this.activeDialog = null;
    }
  }

  async createWidget(): Promise<void> {
    if (!this.canCreate || !this.serviceId || !this.dashboardId) {
      return;
    }

    if (this.createMode === 'new') {
      const { block, widget } = this.ensureLocalBlock(this.serviceId);
      const createdBlock = await tryCreateBlock(block);
      if (!createdBlock) {
        return this.close();
      }
      const createdWidget = await tryCreateWidget<BlockConfig>(widget);
      return this.done({ block: createdBlock, widget: createdWidget });
    }

    if (this.createMode === 'existing' && this.existingBlock) {
      const widget = await tryCreateWidget<BlockConfig>({
        id: this.widgetId,
        title: this.existingBlock.id,
        feature: this.featureId,
        dashboard: this.dashboardId,
        order: 0,
        config: {
          blockId: this.existingBlock.id,
          serviceId: this.existingBlock.serviceId,
        },
        ...this.defaultWidgetSize,
      });
      return this.done({ widget, block: this.existingBlock });
    }
  }
}
</script>

<template>
  <ActionCardBody>
    <div class="widget-body column">
      <q-btn-toggle
        v-model="createMode"
        :options="createModeOpts"
        outline
        class="self-center q-my-md"
      />

      <q-select
        v-model="serviceId"
        :options="serviceOpts"
        label="Service"
        @keyup.enter.exact.stop
      />

      <DashboardSelect
        v-model="dashboardId"
        :default-value="activeDashboardId"
      />

      <template v-if="createMode === 'new'">
        <q-input
          v-model="localBlockId"
          :rules="blockIdRules"
          autofocus
          label="Block name"
        >
          <template #append>
            <KeyboardButton @click="showIdKeyboard" />
            <q-icon name="mdi-information">
              <q-tooltip>
                The name of the Spark Controller block.
                <br>Multiple widgets can display the same block.
                <br>Rules:
                <ul>
                  <li>The name must not be empty.</li>
                  <li>The name must be unique.</li>
                  <li>The name must begin with a letter.</li>
                  <li>The name may only contain alphanumeric characters, space, and _-()|.</li>
                  <li>The name must be less than 200 characters.</li>
                </ul>
              </q-tooltip>
            </q-icon>
          </template>
        </q-input>
      </template>

      <template v-if="createMode === 'existing'">
        <BlockAddressField
          v-model="blockAddress"
          :creatable="false"
          label="Existing block"
        />
      </template>
    </div>

    <template #actions>
      <q-btn flat label="Back" @click="back" />
      <q-space />
      <q-btn
        :disable="!canConfigure"
        flat
        label="Configure block"
        @click="configureBlock"
      />
      <q-btn
        :disable="!canCreate"
        unelevated
        label="Create"
        color="primary"
        @click="createWidget"
      />
    </template>
  </ActionCardBody>
</template>
