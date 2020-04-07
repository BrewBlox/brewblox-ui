<script lang="ts">
import { uid } from 'quasar';
import Vue from 'vue';
import { Component, Emit, Prop } from 'vue-property-decorator';

import { createDialog } from '@/helpers/dialog';
import { objectStringSorter, ruleValidator, suggestId } from '@/helpers/functional';
import notify from '@/helpers/notify';
import { blockIdRules } from '@/plugins/spark/helpers';
import { SparkServiceModule, sparkStore } from '@/plugins/spark/store';
import { Block, BlockCrud } from '@/plugins/spark/types';
import { Widget } from '@/store/dashboards';
import { featureStore } from '@/store/features';


@Component
export default class BlockWizard extends Vue {
  selected: SelectOption | null = null;
  lastGeneratedId = '';
  blockId = '';
  searchFilter = '';

  block: Block | null = null;
  widget: Widget | null = null;
  activeDialog: any = null;

  @Prop({ type: String, required: true })
  readonly serviceId!: string;

  @Prop({ type: String })
  public readonly initialFeature!: string;

  @Prop({ type: Function, default: () => () => true })
  public readonly filter!: (feature: string) => boolean;

  created(): void {
    this.selected =
      this.wizardOptions.find(opt => opt.value === this.initialFeature) ?? null;
  }

  @Emit('created')
  public onCreate(block: Block): Block {
    return block;
  }

  @Emit('close')
  public close(): void { }

  public get sparkModule(): SparkServiceModule {
    return sparkStore.serviceById(this.serviceId)!;
  }

  get blockIdRules(): InputRule[] {
    return blockIdRules(this.serviceId);
  }

  get validator(): ((val: any) => boolean) {
    return ruleValidator(this.blockIdRules);
  }

  get createReady(): boolean {
    return !!this.selected && this.validator(this.blockId);
  }

  get wizardOptions(): SelectOption[] {
    return featureStore.widgetValues
      .filter(feat => feat.wizard === 'BlockWidgetWizard')
      .filter(feat => this.filter(feat.id))
      .map(feat => ({ label: feat.title, value: feat.id }))
      .sort(objectStringSorter('label'));
  }

  get filteredOptions(): SelectOption[] {
    if (!this.searchFilter) {
      return this.wizardOptions;
    }
    const needle = this.searchFilter.toLowerCase();
    return this.wizardOptions
      .filter(opt => opt.label.toLowerCase().match(needle));
  }

  selectOpt(opt: SelectOption, createNow = false): void {
    this.block = null;
    this.widget = null;

    if (this.selected !== opt || createNow) {
      this.selected = opt;
      if (!this.blockId || this.blockId === this.lastGeneratedId) {
        this.blockId = suggestId(opt.label, this.validator);
        this.lastGeneratedId = this.blockId;
      }
      if (createNow) {
        this.createBlock();
      }
    }
    else {
      this.selected = null;
    }
  }

  ensureLocalBlock(): void {
    const featureId = this.selected!.value;
    this.widget = this.widget || {
      id: uid(),
      title: this.blockId,
      feature: featureId,
      dashboard: '',
      order: 0,
      config: {
        serviceId: this.serviceId,
        blockId: this.blockId,
      },
      ...featureStore.widgetSize(featureId),
    };
    this.block = this.block || {
      id: this.blockId,
      serviceId: this.serviceId,
      type: featureId,
      groups: [0],
      data: sparkStore.specs[featureId].generate(),
    };
  }

  configureBlock(): void {
    this.ensureLocalBlock();
    const crud: BlockCrud = {
      widget: this.widget as Widget,
      isStoreWidget: false,
      saveWidget: v => { this.widget = v; },
      block: this.block!,
      isStoreBlock: false,
      saveBlock: v => { this.block = v; },
      closeDialog: this.closeDialog,
    };
    this.activeDialog = createDialog({
      component: 'WidgetDialog',
      parent: this,
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

  async createBlock(): Promise<void> {
    if (!this.createReady) {
      return;
    }
    this.ensureLocalBlock();
    const block = this.block!;
    try {
      await this.sparkModule.createBlock(block);
      notify.done(`Created ${featureStore.widgetTitle(block.type)} block '${this.blockId}'`);
      this.onCreate(this.sparkModule.blockById(this.blockId)!);
    }
    catch (e) {
      notify.error(`Failed to create block: ${e.toString()}`);
    }
    this.close();
  }
}
</script>

<template>
  <ActionCardBody @keyup.ctrl.enter="createBlock">
    <div class="widget-body column">
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

      <template v-if="!initialFeature">
        <div
          v-for="opt in filteredOptions"
          :key="opt.value"
          :class="[
            'col clickable q-pa-sm rounded-borders text-h6',
            selected === opt && 'depth-24',
          ]"
          @click="selectOpt(opt)"
          @dblclick="selectOpt(opt, true)"
        >
          {{ opt.label }}
        </div>
      </template>
    </div>

    <template #actions>
      <q-input
        v-model="blockId"
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
      <q-btn :disable="!createReady" flat label="Configure" @click="configureBlock" />
      <q-btn
        :disable="!createReady"
        unelevated
        label="Create"
        color="primary"
        @click="createBlock"
      />
    </template>
  </ActionCardBody>
</template>
