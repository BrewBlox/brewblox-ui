<script lang="ts">
import get from 'lodash/get';
import isString from 'lodash/isString';
import { Component } from 'vue-property-decorator';

import WidgetWizardBase from '@/components/WidgetWizardBase';
import { createDialog } from '@/helpers/dialog';
import { objectStringSorter } from '@/helpers/functional';
import { blockIdRules } from '@/plugins/spark/helpers';
import { sparkStore } from '@/plugins/spark/store';
import { Block, BlockConfig, BlockCrud, DashboardBlock } from '@/plugins/spark/types';
import { Service, serviceStore } from '@/store/services';

@Component
export default class BlockWidgetWizard extends WidgetWizardBase<BlockConfig> {
  currentStep = 'start';

  blockId = '';
  service: Service | null = null;
  block: Block | null = null;
  isStoreBlock = false;
  widget: DashboardBlock | null = null;
  activeDialog: any = null;

  get serviceId(): string {
    return get(this, ['service', 'id'], '');
  }

  get blockIdRules(): InputRule[] {
    return blockIdRules(this.serviceId);
  }

  get blockOpts(): { id: string }[] {
    if (!this.service) {
      return [];
    }
    return sparkStore.blockValues(this.serviceId)
      .filter(block => block.type === this.typeId)
      .sort(objectStringSorter('id'));
  }

  get serviceOpts(): SelectOption[] {
    return serviceStore.serviceValues
      .filter(service => service.type === 'Spark')
      .map(service => ({
        label: service.title,
        value: service,
      }));
  }

  get startOk(): boolean {
    return !!this.service;
  }

  get createOk(): boolean {
    return !!this.service
      && !this.blockIdRules.some(rule => isString(rule(this.blockId)));
  }

  get existingOk(): boolean {
    return !!this.service && !!this.block;
  }

  ensureItem(): void {
    this.block = this.block || {
      id: this.blockId,
      serviceId: this.serviceId,
      type: this.typeId,
      groups: [0],
      data: sparkStore.specs[this.typeId].generate(),
    };
    this.blockId = this.block.id; // for when using existing block
    this.widget = this.widget || {
      id: this.widgetId,
      title: this.blockId,
      feature: this.typeId,
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
      await sparkStore.saveBlock([block.serviceId, block]);
    }
  }

  configureBlock(): void {
    this.ensureItem();
    const crud: BlockCrud = {
      widget: this.widget!,
      isStoreWidget: false,
      saveWidget: v => { this.widget = v; },
      block: this.block as Block,
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
    const service = this.service as Service;
    const block = this.block as Block;

    if (!sparkStore.blockIds(service.id).includes(block.id)) {
      await sparkStore.createBlock([service.id, block]);
    }

    this.createItem(this.widget!);
  }

  mounted(): void {
    if (this.serviceOpts.length > 0) {
      this.service = this.serviceOpts[0].value;
    }
  }
}
</script>

<template>
  <q-stepper
    v-model="currentStep"
    :bordered="false"
    class="bg-dark-bright no-border"
    vertical
    animated
  >
    <q-step name="start" title="Select Service">
      <ValueField label="Service" item-aligned>
        <q-option-group v-model="service" :options="serviceOpts" />
      </ValueField>
      <q-stepper-navigation class="row">
        <q-btn unelevated label="Back" @click="back" />
        <q-space />
        <q-btn
          :disable="!startOk"
          unelevated
          label="Create new Block"
          color="primary"
          class="q-mx-md"
          @click="isStoreBlock = false; currentStep = 'create'"
        />
        <q-btn
          :disable="!startOk"
          unelevated
          label="Use existing Block"
          color="primary"
          @click="isStoreBlock = true; currentStep = 'existing'"
        />
      </q-stepper-navigation>
    </q-step>

    <q-step name="create" title="Create new Block">
      <q-item>
        <q-item-section>
          <q-input v-model="blockId" :rules="blockIdRules" autofocus label="Block name">
            <template #append>
              <q-icon name="mdi-information">
                <q-tooltip>
                  The name of the Spark Controller Block.
                  <br />Multiple widgets can display the same Block.
                  <br />Rules:
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
      <q-stepper-navigation class="row">
        <q-btn unelevated label="Back" @click="block = null; currentStep = 'start'" />
        <q-space />
        <q-btn
          :disable="!createOk"
          flat
          label="Configure Block"
          class="q-mx-md"
          @click="configureBlock"
        />
        <q-btn
          :disable="!createOk"
          unelevated
          label="Create"
          color="primary"
          @click="createWidget"
        />
      </q-stepper-navigation>
    </q-step>

    <q-step name="existing" title="Use existing Block">
      <q-item>
        <q-item-section>
          <q-select
            :value="block"
            :options="blockOpts"
            :rules="[v => !!v || 'You must select a Block']"
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
      <q-stepper-navigation class="row">
        <q-btn unelevated label="Back" @click="block = null; currentStep = 'start'" />
        <q-space />
        <q-btn
          :disable="!existingOk"
          flat
          label="Configure Block"
          class="q-mx-md"
          @click="configureBlock"
        />
        <q-btn
          :disable="!existingOk"
          unelevated
          label="Create"
          color="primary"
          @click="createWidget"
        />
      </q-stepper-navigation>
    </q-step>
  </q-stepper>
</template>
