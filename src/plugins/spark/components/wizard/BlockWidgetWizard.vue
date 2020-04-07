<script lang="ts">
import { Component } from 'vue-property-decorator';

import WidgetWizardBase from '@/components/WidgetWizardBase';
import { createDialog } from '@/helpers/dialog';
import { objectStringSorter, ruleValidator, suggestId } from '@/helpers/functional';
import { sparkType } from '@/plugins/spark/getters';
import { blockIdRules } from '@/plugins/spark/helpers';
import { sparkStore } from '@/plugins/spark/store';
import { Block, BlockConfig, BlockCrud } from '@/plugins/spark/types';
import { Widget } from '@/store/dashboards';
import { featureStore } from '@/store/features';
import { Service, serviceStore } from '@/store/services';

@Component
export default class BlockWidgetWizard extends WidgetWizardBase<BlockConfig> {
  currentStep = 'start';

  blockId = '';
  service: Service | null = null;
  block: Block | null = null;
  isStoreBlock = false;
  widget: Widget<BlockConfig> | null = null;
  activeDialog: any = null;

  mounted(): void {
    this.service = this.serviceOpts[0]?.value ?? null;
    const title = featureStore.widgetTitle(this.featureId);
    this.blockId = suggestId(title, ruleValidator(this.blockIdRules));
  }

  get serviceId(): string {
    return this.service?.id ?? '';
  }

  get blockIdRules(): InputRule[] {
    return blockIdRules(this.serviceId);
  }

  get blockOpts(): { id: string }[] {
    if (!this.service) {
      return [];
    }
    return sparkStore.serviceBlocks(this.serviceId)
      .filter(block => block.type === this.featureId)
      .sort(objectStringSorter('id'));
  }

  get serviceOpts(): SelectOption[] {
    return serviceStore.services
      .filter(service => service.type === sparkType)
      .map(service => ({
        label: service.title,
        value: service,
      }));
  }

  get startOk(): boolean {
    return !!this.service;
  }

  get createOk(): boolean {
    return !!this.service && ruleValidator(this.blockIdRules)(this.blockId);
  }

  get existingOk(): boolean {
    return !!this.service && !!this.block;
  }

  ensureItem(): void {
    this.block = this.block ?? {
      id: this.blockId,
      serviceId: this.serviceId,
      type: this.featureId,
      groups: [0],
      data: sparkStore.spec({ type: this.featureId }).generate(),
    };
    this.blockId = this.block.id; // for when using existing block
    this.widget = this.widget ?? {
      id: this.widgetId,
      title: this.blockId,
      feature: this.featureId,
      dashboard: this.dashboardId,
      order: 0,
      config: {
        serviceId: this.serviceId,
        blockId: this.blockId,
      },
      ...this.defaultWidgetSize,
    };
  }

  async saveBlock(block: Block): Promise<void> {
    this.block = block;
    if (this.isStoreBlock) {
      await sparkStore.saveBlock(block);
    }
  }

  configureBlock(): void {
    this.ensureItem();
    const crud: BlockCrud = {
      widget: this.widget!,
      isStoreWidget: false,
      saveWidget: v => { this.widget = v; },
      block: this.block!,
      isStoreBlock: this.isStoreBlock,
      saveBlock: this.saveBlock,
      closeDialog: this.closeDialog,
    };
    this.activeDialog = createDialog({
      component: 'WidgetDialog',
      parent: this,
      getCrud: () => crud,
      mode: 'Full',
    });
  }

  public closeDialog(): void {
    if (this.activeDialog) {
      this.activeDialog.hide();
      this.activeDialog = null;
    }
  }

  async createWidget(): Promise<void> {
    this.ensureItem();
    const service = this.service!;
    const block = this.block!;

    if (!sparkStore.blockById(service.id, block.id)) {
      await sparkStore.createBlock(block);
    }

    this.createItem(this.widget!);
  }
}
</script>

<template>
  <ActionCardBody>
    <q-stepper
      v-model="currentStep"
      :bordered="false"
      class="no-border"
      vertical
      animated
    >
      <q-step name="start" title="Select Service">
        <LabeledField label="Service" item-aligned>
          <q-option-group v-model="service" :options="serviceOpts" />
        </LabeledField>
        <portal to="widget-wizard-nav">
          <q-btn unelevated label="Back" @click="back" />
          <q-space />
          <q-btn
            :disable="!startOk"
            unelevated
            label="Create new block"
            color="primary"
            @click="isStoreBlock = false; currentStep = 'create'"
          />
          <q-btn
            :disable="!startOk"
            unelevated
            label="Use existing block"
            color="primary"
            @click="isStoreBlock = true; currentStep = 'existing'"
          />
        </portal>
      </q-step>

      <q-step name="create" title="Create new block">
        <q-item>
          <q-item-section>
            <q-input v-model="blockId" :rules="blockIdRules" autofocus label="Block name">
              <template #append>
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
          </q-item-section>
        </q-item>
        <portal to="widget-wizard-nav">
          <q-btn unelevated label="Back" @click="block = null; currentStep = 'start'" />
          <q-space />
          <q-btn
            :disable="!createOk"
            flat
            label="Configure block"
            @click="configureBlock"
          />
          <q-btn
            :disable="!createOk"
            unelevated
            label="Create"
            color="primary"
            @click="createWidget"
          />
        </portal>
      </q-step>

      <q-step name="existing" title="Use existing block">
        <q-item>
          <q-item-section>
            <q-select
              :value="block"
              :options="blockOpts"
              :rules="[v => !!v || 'You must select a block']"
              option-label="id"
              option-value="id"
              label="Block"
              autofocus
              @input="v => { block = v; widget = null}"
            >
              <template #no-option>
                <q-item>
                  <q-item-section class="text-grey">
                    No results
                  </q-item-section>
                </q-item>
              </template>
            </q-select>
          </q-item-section>
        </q-item>
        <portal to="widget-wizard-nav">
          <q-btn unelevated label="Back" @click="block = null; currentStep = 'start'" />
          <q-space />
          <q-btn
            :disable="!existingOk"
            flat
            label="Configure block"
            @click="configureBlock"
          />
          <q-btn
            :disable="!existingOk"
            unelevated
            label="Create"
            color="primary"
            @click="createWidget"
          />
        </portal>
      </q-step>
    </q-stepper>

    <template #actions>
      <portal-target name="widget-wizard-nav" class="full-width row justify-end q-gutter-sm" />
    </template>
  </ActionCardBody>
</template>
