<script lang="ts">
import { uid } from 'quasar';
import { Component, Prop } from 'vue-property-decorator';

import { createDialog } from '@/helpers/dialog';
import { nullFilter, objectStringSorter, ruleValidator, suggestId } from '@/helpers/functional';
import { blockIdRules, isCompatible } from '@/plugins/spark/helpers';
import { SparkServiceModule, sparkStore } from '@/plugins/spark/store';
import type { Block, BlockCrud, BlockSpec, ComparedBlockType } from '@/plugins/spark/types';
import { tryCreateBlock, tryCreateWidget } from '@/plugins/wizardry';
import WizardBase from '@/plugins/wizardry/WizardBase';
import { Widget } from '@/store/dashboards';
import { featureStore } from '@/store/features';

interface BlockWizardOption extends SelectOption {
  spec: BlockSpec;
}

@Component
export default class BlockWizard extends WizardBase {
  selected: BlockWizardOption | null = null;
  lastGeneratedId = '';
  serviceId: string | null = null;
  dashboardId: string | null = null;
  blockId = '';
  searchFilter = '';

  block: Block | null = null;
  activeDialog: any = null;
  discoveryActive = false;

  @Prop({ type: String })
  public readonly activeServiceId!: string;

  @Prop({ type: [String, Array], required: false })
  readonly compatible!: ComparedBlockType;

  @Prop({ type: Function, default: () => () => true })
  readonly filter!: (feature: string) => boolean;

  mounted(): void {
    this.serviceId = this.activeServiceId
      ?? sparkStore.serviceIds[0]
      ?? null;

    if (this.wizardOptions.length === 1) {
      this.selectOpt(this.wizardOptions[0]);
    }

    this.reset();
  }

  get serviceOpts(): string[] {
    return sparkStore.serviceIds;
  }

  get wizardOptions(): BlockWizardOption[] {
    return sparkStore
      .specs
      .filter(spec =>
        !spec.systemObject
        && isCompatible(spec.id, this.compatible)
        && this.filter(spec.id))
      .map(spec => {
        const feature = featureStore.widgetById(spec.id);
        return feature
          ? { spec, value: spec.id, label: feature.title }
          : null;
      })
      .filter(nullFilter)
      .sort(objectStringSorter('label'));
  }

  public get sparkModule(): SparkServiceModule | null {
    return sparkStore.moduleById(this.serviceId);
  }

  get blockIdRules(): InputRule[] {
    return this.serviceId
      ? blockIdRules(this.serviceId)
      : [() => 'No service selected'];
  }

  get validator(): ((val: any) => boolean) {
    return ruleValidator(this.blockIdRules);
  }

  get createReady(): boolean {
    return this.selected !== null
      && this.sparkModule !== null
      && this.validator(this.blockId);
  }

  get discoveredType(): boolean {
    return this.selected?.spec.discovered === true;
  }

  get searchedOptions(): SelectOption[] {
    if (!this.searchFilter) {
      return this.wizardOptions;
    }
    const needle = this.searchFilter.toLowerCase();
    return this.wizardOptions
      .filter(opt => opt.label.toLowerCase().match(needle));
  }

  selectOpt(opt: BlockWizardOption | null): void {
    this.block = null;

    this.selected = opt;
    if (opt === null) {
      return;
    }
    else if (!this.blockId || this.blockId === this.lastGeneratedId) {
      this.blockId = suggestId(opt.label, this.validator);
      this.lastGeneratedId = this.blockId;
    }
  }

  ensureLocals(serviceId: string): { block: Block; widget: Widget } {
    if (this.block?.serviceId !== serviceId) {
      this.block = null;
    }

    const featureId = this.selected!.value;

    const block: Block = this.block ?? {
      id: this.blockId,
      serviceId,
      type: featureId,
      groups: [0],
      data: sparkStore.spec({ type: featureId }).generate(this.serviceId),
    };
    const widget: Widget = {
      id: uid(),
      title: this.blockId,
      feature: featureId,
      dashboard: this.dashboardId ?? '',
      order: 0,
      config: {
        serviceId,
        blockId: this.blockId,
      },
      ...featureStore.widgetSize(featureId),
    };

    this.block = block;
    this.block.id = this.blockId;

    return { block, widget };
  }

  configureBlock(): void {
    if (!this.createReady || !this.serviceId || !this.sparkModule) {
      return;
    }
    const { block, widget } = this.ensureLocals(this.serviceId);
    const crud: BlockCrud = {
      block,
      widget,
      isStoreWidget: false,
      saveWidget: () => { },
      isStoreBlock: false,
      saveBlock: v => { this.block = v; },
      closeDialog: this.closeDialog,
    };
    this.activeDialog = createDialog({
      component: 'WidgetDialog',
      getCrud: () => crud,
      mode: 'Full',
    });
  }

  closeDialog(): void {
    if (this.activeDialog) {
      this.activeDialog.hide();
      this.activeDialog = null;
    }
  }

  reset(): void {
    this.discoveryActive = false;
    this.setDialogTitle('Block wizard');
  }

  async createBlock(): Promise<void> {
    if (!this.createReady || !this.serviceId || !this.sparkModule) {
      return;
    }
    const { block, widget } = this.ensureLocals(this.serviceId);

    const createdBlock = await tryCreateBlock(block);

    if (!createdBlock) {
      return this.close();
    }

    const createdWidget = this.dashboardId
      ? await tryCreateWidget(widget)
      : null;

    return this.done({ block: createdBlock, widget: createdWidget });
  }
}
</script>

<template>
  <BlockDiscoveryWizard
    v-if="discoveryActive && selected"
    :feature-id="selected.value"
    :active-dashboard-id="dashboardId"
    :active-service-id="serviceId"
    optional-widget
    @title="setDialogTitle"
    @back="reset"
    @close="close"
    @done="done"
  />

  <ActionCardBody v-else>
    <div class="widget-body column">
      <q-select
        v-model="serviceId"
        :options="serviceOpts"
        label="Service"
        @keyup.enter.exact.stop
      />

      <DashboardSelect
        v-model="dashboardId"
        label="Add to dashboard (optional)"
        clearable
      />

      <q-input
        v-model="searchFilter"
        placeholder="Search"
        clearable
        autofocus
        class="q-mb-md"
      >
        <template #append>
          <q-icon name="search" />
        </template>
      </q-input>

      <ListSelect
        :value="selected"
        :options="searchedOptions"
        option-value="value"
        option-label="label"
        @input="selectOpt"
        @confirm="v => { selectOpt(v); createBlock(); }"
      />
    </div>

    <template #actions>
      <q-input
        v-model="blockId"
        :disable="discoveredType"
        :rules="blockIdRules"
        label="Block name"
        clearable
        class="col-12"
      >
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
      <q-btn flat label="Back" @click="back" />
      <q-space />
      <template v-if="discoveredType">
        <q-btn
          unelevated
          label="Discover"
          color="primary"
          @click="discoveryActive = true"
        />
      </template>
      <template v-else>
        <q-btn
          :disable="!createReady"
          flat
          label="Configure"
          @click="configureBlock"
        />
        <q-btn
          :disable="!createReady"
          unelevated
          label="Create"
          color="primary"
          @click="createBlock"
        />
      </template>
    </template>
  </ActionCardBody>
</template>
