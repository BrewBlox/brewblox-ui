<script lang="ts">
import isArray from 'lodash/isArray';
import { SessionStorage } from 'quasar';
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { Watch } from 'vue-property-decorator';

import { createBlockDialog, createDialog } from '@/helpers/dialog';
import { capitalized, mutate, objectStringSorter } from '@/helpers/functional';
import notify from '@/helpers/notify';
import { SparkServiceModule, sparkStore } from '@/plugins/spark/store';
import type {
  Block,
  BlockCrud,
  BlockType,
  PageMode,
  RelationEdge,
  RelationNode,
  SparkService,
  SparkStatus,
} from '@/plugins/spark/types';
import { createBlockWizard } from '@/plugins/wizardry';
import { Dashboard, dashboardStore, Widget } from '@/store/dashboards';
import { featureStore, WidgetContext } from '@/store/features';
import { serviceStore } from '@/store/services';

import { roleIcons } from '../getters';
import { blockSorters, defaultSessionConfig, storageKey } from './helpers';
import SparkWidget from './SparkWidget.vue';
import SparkWidgetDialog from './SparkWidgetDialog.vue';
import Troubleshooter from './Troubleshooter.vue';
import { ValidatedWidget } from './types';

interface ModalSettings {
  component: string;
  props: any;
}

@Component({
  components: {
    SparkWidget,
    SparkWidgetDialog,
    Troubleshooter,
  },
})
export default class SparkPage extends Vue {
  capitalized = capitalized;

  allSorters = blockSorters();
  volatileWidgets: { [blockId: string]: Widget } = {};
  blockFilter = '';
  sessionCfg = defaultSessionConfig();

  context: WidgetContext = {
    mode: 'Basic',
    container: 'Dashboard',
    size: 'Content',
  };

  @Prop({ type: String, required: true })
  readonly serviceId!: string;

  @Watch('serviceId', { immediate: true })
  watchId(): void {
    this.loadSessionConfig();
  }

  @Watch('service.title', { immediate: true })
  watchTitle(newV: string): void {
    document.title = `Brewblox | ${newV ?? 'Spark service'}`;
  }

  get service(): SparkService {
    return serviceStore.serviceById(this.serviceId)!;
  }

  get sparkModule(): SparkServiceModule | null {
    return sparkStore.moduleById(this.serviceId);
  }

  get dashboards(): Dashboard[] {
    return dashboardStore.dashboards;
  }

  get isAvailable(): boolean {
    return this.service !== null
      && this.sparkModule !== null;
  }

  get isReady(): boolean {
    return this.isAvailable
      && this.sparkModule!.lastBlocks !== null;
  }

  get status(): SparkStatus | null {
    return this.sparkModule?.status ?? null;
  }

  get statusNok(): boolean {
    return this.isAvailable
      && this.status !== null
      && (!this.status.isSynchronized || !!this.status.isUpdating);
  }

  get pageMode(): PageMode {
    return this.sessionCfg.pageMode ?? 'List';
  }

  set pageMode(mode: PageMode) {
    this.sessionCfg.pageMode = mode;
    this.saveSessionConfig();
  }

  get sorting(): string {
    return this.sessionCfg.sorting ?? 'unsorted';
  }

  set sorting(val: string) {
    this.sessionCfg.sorting = val;
    this.saveSessionConfig();
  }

  get sorter(): (a: ValidatedWidget, b: ValidatedWidget) => number {
    return this.allSorters[this.sorting] ?? (() => 0);
  }

  get expandedBlocks(): { [id: string]: boolean } {
    return this.sessionCfg.expandedBlocks ?? {};
  }

  set expandedBlocks(expanded: { [id: string]: boolean }) {
    this.sessionCfg.expandedBlocks =
      [...this.sparkModule!.blockIds, '_service']
        .reduce((acc, id) => mutate(acc, id, expanded[id] ?? false), {});
    this.saveSessionConfig();
  }

  get serviceExpanded(): boolean {
    return this.expandedBlocks['_service'] ?? false;
  }

  set serviceExpanded(val: boolean) {
    this.expandedBlocks = { ...this.expandedBlocks, ['_service']: val };
  }

  get serviceShown(): boolean {
    return !this.blockFilter ||
      !!this.service.id.toLowerCase().match(this.blockFilter.toLowerCase());
  }

  loadSessionConfig(): void {
    try {
      this.sessionCfg = SessionStorage.getItem(storageKey(this.serviceId)) ?? defaultSessionConfig();
    }
    catch (e) {
      this.sessionCfg = defaultSessionConfig();
    }
  }

  saveSessionConfig(): void {
    try {
      SessionStorage.set(storageKey(this.serviceId), this.sessionCfg);
    }
    catch (e) {
      // ignore
    }
  }

  scrollTo(id: string): void {
    let item: any = this.$refs[`widget-${this.volatileKey(id)}`];
    item = isArray(item) ? item[0] : item;
    if (item !== undefined) {
      item.$el.scrollIntoView();
    }
  }

  showSearchKeyboard(): void {
    createDialog({
      component: 'KeyboardDialog',
      value: this.blockFilter,
    })
      .onOk((v: string) => this.blockFilter = v);
  }

  selectService(): void {
    if (this.$dense && this.isReady) {
      createDialog({
        component: SparkWidgetDialog,
        serviceId: this.serviceId,
      });
    }
    else {
      this.serviceExpanded = true;
      let item: any = this.$refs['widget-spark-service'];
      item = isArray(item) ? item[0] : item;
      if (item !== undefined) {
        item.$el.scrollIntoView();
      }
    }
  }

  updateExpandedBlock(id: string, val: boolean): void {
    this.expandedBlocks = { ...this.expandedBlocks, [id]: val };
    if (val) {
      this.$nextTick(() => this.scrollTo(id));
    }
  }

  volatileKey(blockId: string): string {
    return `${this.service.id}/${blockId}`;
  }

  validateBlock(block: Block): ValidatedWidget {
    const key = this.volatileKey(block.id);
    const existing = this.volatileWidgets[key];
    if (existing?.feature !== block.type) {
      this.$set(
        this.volatileWidgets,
        key,
        {
          id: block.id,
          title: block.id,
          feature: block.type,
          order: 0,
          dashboard: '',
          config: {
            serviceId: block.serviceId,
            blockId: block.id,
          },
          ...featureStore.widgetSize(block.type),
        });
    }
    const widget = this.volatileWidgets[key];
    const crud: BlockCrud = {
      widget,
      saveWidget: this.saveWidget,
      isStoreWidget: false,
      closeDialog: () => { },
      block,
      saveBlock: this.saveBlock,
      isStoreBlock: true,
    };
    const { id } = widget;
    const { component, error } = featureStore.widgetComponent(crud);
    const role = featureStore.widgetRole(widget.feature);
    return {
      id,
      key,
      crud,
      component,
      error,
      role,
      icon: roleIcons[role] ?? '',
      title: featureStore.widgetTitle(widget.feature),
      expanded: this.expandedBlocks[widget.id] ?? false,
    };
  }

  get validTypes(): BlockType[] {
    return sparkStore.specs.map(s => s.id);
  }

  get validatedItems(): ValidatedWidget[] {
    return this.sparkModule
      ?.blocks
      .filter(block => this.validTypes.includes(block.type))
      .map(this.validateBlock)
      ?? [];
  }

  get filteredItems(): ValidatedWidget[] {
    const filter = RegExp(this.blockFilter, 'i');
    return this.validatedItems
      .filter(val => !filter
        || val.id.match(filter)
        || val.title.match(filter))
      .sort(this.sorter);
  }

  get expandedItems(): ValidatedWidget[] {
    return this.filteredItems.filter(item => item.expanded);
  }

  expandAll(): void {
    this.expandedBlocks = [...this.sparkModule!.blockIds, '_service']
      .reduce((acc, id) => mutate(acc, id, true), {});
  }

  expandNone(): void {
    this.expandedBlocks = {};
  }

  saveWidget(widget: Widget): void {
    this.volatileWidgets[this.volatileKey(widget.id)] = { ...widget };
    notify.warn('Changes will not be persisted', { logged: false });
  }

  async saveBlock(block: Block): Promise<void> {
    sparkStore.saveBlock(block);
  }

  startDialog(component: string, props: any = null): void {
    const args = props ?? {
      serviceId: this.service.id,
    };
    createDialog({
      component,
      ...args,
    });
  }

  startCreateBlock(): void {
    createBlockWizard(this.serviceId)
      .onOk(({ block }) => {
        if (block) {
          this.updateExpandedBlock(block.id, true);
        }
      });
  }

  get nodes(): RelationNode[] {
    return this.validatedItems
      .map(v => ({ id: v.id, type: v.title }))
      .sort(objectStringSorter('type'));
  }

  get edges(): RelationEdge[] {
    return this.sparkModule?.relations ?? [];
  }

  controllerReboot(): void {
    this.sparkModule?.controllerReboot();
  }

  serviceReboot(): void {
    this.sparkModule?.serviceReboot();
  }

  onBlockClick(val: ValidatedWidget): void {
    if (this.$dense) {
      createBlockDialog(val.crud.block, { mode: 'Basic' });
    }
    else if (val.expanded) {
      this.scrollTo(val.id);
    }
    else {
      this.updateExpandedBlock(val.id, true);
    }
  }
}
</script>

<template>
  <q-page class="page-height">
    <portal to="toolbar-title">
      {{ service.title }}
    </portal>
    <portal to="toolbar-buttons">
      <q-btn-group rounded outline class="q-pa-xs self-center">
        <q-btn
          :unelevated="pageMode === 'List'"
          :outline="pageMode !== 'List'"
          color="primary"
          icon="mdi-format-list-checkbox"
          @click="pageMode = 'List'"
        >
          <q-tooltip>Show blocks as list</q-tooltip>
        </q-btn>
        <q-btn
          rounded
          :unelevated="pageMode === 'Relations'"
          :outline="pageMode !== 'Relations'"
          color="primary"
          icon="mdi-vector-line"
          @click="pageMode = 'Relations'"
        >
          <q-tooltip>Show blocks as diagram</q-tooltip>
        </q-btn>
      </q-btn-group>
      <ActionMenu
        :disable="!isReady || statusNok"
        round
        size="12px"
        class="self-center"
      >
        <q-tooltip>
          Service actions
        </q-tooltip>
        <template #menus>
          <SparkActions :service-id="serviceId" />
        </template>
      </ActionMenu>
    </portal>

    <!-- Troubleshooter -->
    <div
      v-if="statusNok"
      class="q-pa-lg row"
    >
      <Troubleshooter
        :service-id="service.id"
      />
    </div>

    <!-- Relations graph display -->
    <div
      v-else-if="pageMode === 'Relations'"
      class="fit"
      @dblclick="startCreateBlock"
    >
      <RelationsDiagram
        :service-id="service.id"
        :nodes="nodes"
        :edges="edges"
      />
    </div>

    <!-- Block list display -->
    <div
      v-else-if="pageMode === 'List'"
      class="fit q-pa-lg row no-wrap justify-start"
      @dblclick="startCreateBlock"
    >
      <q-scroll-area
        visible
        class="content-column rounded-borders bg-dark"
      >
        <q-list class="q-pr-md" @dblclick.stop.prevent>
          <!-- Selection controls -->
          <q-item class="q-mb-md">
            <q-item-section>
              <q-input v-model="blockFilter" placeholder="Search blocks" clearable>
                <template #append>
                  <KeyboardButton @click="showSearchKeyboard" />
                  <q-icon name="search" />
                </template>
              </q-input>
            </q-item-section>
            <q-item-section class="col-auto">
              <q-btn icon="mdi-sort" flat>
                <q-tooltip>Sort blocks</q-tooltip>
                <q-menu>
                  <q-list>
                    <ActionItem
                      v-for="(func, name) in allSorters"
                      :key="name"
                      :active="sorting === name"
                      :label="capitalized(name)"
                      @click="sorting = name"
                    />
                  </q-list>
                </q-menu>
              </q-btn>
            </q-item-section>
            <q-item-section v-if="!$dense" class="col-auto">
              <q-btn flat round icon="mdi-checkbox-multiple-blank-outline" @click="expandNone">
                <q-tooltip>Unselect all</q-tooltip>
              </q-btn>
            </q-item-section>
            <q-item-section v-if="!$dense" class="col-auto">
              <q-btn flat round icon="mdi-checkbox-multiple-marked" @click="expandAll">
                <q-tooltip>Select all</q-tooltip>
              </q-btn>
            </q-item-section>
          </q-item>
          <!-- Service -->
          <q-item v-if="serviceShown" class="text-white widget-index">
            <q-item-section v-if="!$dense" side class="q-px-sm">
              <ToggleButton v-model="serviceExpanded" />
            </q-item-section>
            <q-item-section>
              <q-item class="non-selectable" clickable @click="selectService">
                <q-item-section avatar>
                  <q-icon name="mdi-information-variant" />
                  <q-tooltip>Device Info</q-tooltip>
                </q-item-section>
                <q-item-section>
                  <q-item-label caption class="text-italic">
                    Device info
                  </q-item-label>
                  <div style="font-size: larger">
                    {{ serviceId }}
                  </div>
                </q-item-section>
              </q-item>
            </q-item-section>
          </q-item>
          <!-- Blocks -->
          <q-item
            v-for="val in filteredItems"
            :key="`filtered-${val.key}`"
            class="non-selectable text-white widget-index"
          >
            <q-item-section v-if="!$dense" side class="q-px-sm">
              <ToggleButton :value="val.expanded" @input="v => updateExpandedBlock(val.id, v)" />
            </q-item-section>
            <q-item-section>
              <q-item
                clickable
                @click="onBlockClick(val)"
              >
                <q-item-section avatar>
                  <q-icon :name="val.icon" />
                  <q-tooltip>{{ val.role }}</q-tooltip>
                </q-item-section>
                <q-item-section>
                  <q-item-label caption class="text-italic darkish">
                    {{ val.title }}
                  </q-item-label>
                  <div style="font-size: larger">
                    {{ val.id }}
                  </div>
                </q-item-section>
              </q-item>
            </q-item-section>
          </q-item>
        </q-list>
      </q-scroll-area>

      <!-- Widget List -->
      <q-scroll-area
        v-if="!$dense"
        visible
        class="content-column"
      >
        <q-list class="q-ml-lg q-pr-none" @dblclick.stop.prevent>
          <!-- Service -->
          <q-item v-if="serviceShown && serviceExpanded" ref="widget-spark-service">
            <q-item-section>
              <SparkWidget v-if="isReady" :service-id="service.id" />
            </q-item-section>
          </q-item>
          <!-- Blocks -->
          <q-item
            v-for="val in expandedItems"
            :ref="`widget-${val.key}`"
            :key="`expanded-${val.key}`"
            class="q-pt-none q-pb-md"
          >
            <q-item-section>
              <component
                :is="val.component"
                :initial-crud="val.crud"
                :context="context"
                :error="val.error"
              />
            </q-item-section>
          </q-item>
          <!-- Blank space to always be able to show a widget at the top -->
          <q-item class="page-height" @dblclick.native="startCreateBlock" />
        </q-list>
      </q-scroll-area>
    </div>
  </q-page>
</template>

<style lang="sass" scoped>
.widget-index
  padding: 0

.page-height
  height: calc(100vh - 40px - 30px - 50px)

.content-column
  width: 550px
  max-width: 100vw
  height: 100%

.selected-mode
  background-color: $secondary
</style>
