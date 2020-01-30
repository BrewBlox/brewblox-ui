<script lang="ts">
import { uid } from 'quasar';
import Vue from 'vue';
import { Component, Emit, Prop } from 'vue-property-decorator';

import { createDialog } from '@/helpers/dialog';
import { objectStringSorter, ruleValidator } from '@/helpers/functional';
import notify from '@/helpers/notify';
import { blockIdRules } from '@/plugins/spark/helpers';
import { sparkStore } from '@/plugins/spark/store';
import { Block, BlockCrud } from '@/plugins/spark/types';
import { Widget } from '@/store/dashboards';
import { featureStore } from '@/store/features';


@Component
export default class BlockWizard extends Vue {
  filteredOptions: any[] = [];
  wizardModel: SelectOption | null = null;
  blockId = '';
  block: Block | null = null;
  widget: Widget | null = null;
  activeDialog: any = null;

  @Prop({ type: String, required: true })
  readonly serviceId!: string;

  @Prop({ type: String })
  public readonly initialFeature!: string;

  @Prop({ type: Function, default: () => () => true })
  public readonly filter!: (feature: string) => boolean;

  @Emit('created')
  public onCreate(block: Block): Block {
    return block;
  }

  @Emit('close')
  public close(): void { }

  get blockIdRules(): InputRule[] {
    return blockIdRules(this.serviceId);
  }

  get createReady(): boolean {
    return !!this.wizardModel && ruleValidator(this.blockIdRules)(this.blockId);
  }

  get wizardOptions(): SelectOption[] {
    return featureStore.widgetValues
      .filter(feat => feat.wizard === 'BlockWidgetWizard')
      .filter(feat => this.filter(feat.id))
      .map(feat => ({ label: feat.title, value: feat.id }))
      .sort(objectStringSorter('label'));
  }

  filterFn(val, update): void {
    if (val === '') {
      update(() => this.filteredOptions = this.wizardOptions);
      return;
    }

    update(() => {
      const needle = val.toLowerCase();
      this.filteredOptions = this.wizardOptions
        .filter(opt => opt.label.toLowerCase().match(needle));
    });
  }

  ensureLocalBlock(): void {
    const featureId = this.wizardModel!.value;
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
    try {
      await sparkStore.createBlock(this.block!);
      notify.done(`Created ${featureStore.widgetTitle(this.block!.type)} block '${this.blockId}'`);
      this.onCreate(sparkStore.blockById(this.serviceId, this.blockId));
    } catch (e) {
      notify.error(`Failed to create block: ${e.toString()}`);
    }
    this.close();
  }

  created(): void {
    this.wizardModel =
      this.wizardOptions.find(opt => opt.value === this.initialFeature) ?? null;
  }
}
</script>

<template>
  <ActionCardBody @keyup.ctrl.enter="createBlock">
    <q-card-section>
      <q-item>
        <q-item-section>
          <q-select
            v-model="wizardModel"
            :options="filteredOptions"
            :rules="[v => !!v || 'You must select a block type']"
            :disable="!!initialFeature"
            label="Block Type"
            use-input
            autofocus
            @filter="filterFn"
            @change="block = null; widget = null;"
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
      <q-item>
        <q-item-section>
          <q-input v-model="blockId" :rules="blockIdRules" label="Block name">
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
    </q-card-section>

    <template #actions>
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
