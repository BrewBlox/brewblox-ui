<script lang="ts">
import isArray from 'lodash/isArray';
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { Watch } from 'vue-property-decorator';

import { createDialog } from '@/helpers/dialog';
import { capitalized, mutate, objectStringSorter } from '@/helpers/functional';
import notify from '@/helpers/notify';
import { saveHwInfo, startResetBlocks } from '@/plugins/spark/helpers';
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
import { Dashboard, dashboardStore, Widget } from '@/store/dashboards';
import { featureStore, WidgetContext, WidgetRole } from '@/store/features';
import { serviceStore } from '@/store/services';

import Troubleshooter from './Troubleshooter.vue';

interface ModalSettings {
  component: string;
  props: any;
}

interface ValidatedWidget {
  id: string;
  key: string;
  component: string;
  crud: BlockCrud;
  title: string;
  role: WidgetRole;
  expanded: boolean;
  error?: string;
}

@Component({
  components: {
    Troubleshooter,
  },
})
export default class SparkPage extends Vue {
  capitalized = capitalized;
  startResetBlocks = startResetBlocks;
  saveHwInfo = saveHwInfo;

  volatileWidgets: { [blockId: string]: Widget } = {};
  blockFilter = '';

  context: WidgetContext = {
    mode: 'Basic',
    container: 'Dashboard',
    size: 'Content',
  };

  roleOrder: Record<WidgetRole, number> = {
    Display: 0,
    Process: 1,
    Control: 2,
    Output: 3,
    Constraint: 4,
    Other: 5,
  };

  roleIcons: Record<WidgetRole, string> = {
    Display: 'mdi-monitor-dashboard',
    Process: 'mdi-thermometer',
    Control: 'mdi-calculator-variant',
    Output: 'mdi-power-plug',
    Constraint: 'mdi-lock-outline',
    Other: 'mdi-cube',
  };

  @Prop({ type: String, required: true })
  readonly serviceId!: string;

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
      && !this.status.synchronize;
  }

  get pageMode(): PageMode {
    return this.service.config.pageMode ?? 'List';
  }

  set pageMode(mode: PageMode) {
    this.service.config.pageMode = mode;
    this.saveServiceConfig();
  }

  get allSorters(): { [id: string]: (a: ValidatedWidget, b: ValidatedWidget) => number } {
    return {
      unsorted: () => 0,
      name: (a, b) => objectStringSorter('id')(a, b),
      type: (a, b): number => {
        const left = a.title.toLowerCase();
        const right = b.title.toLowerCase();
        return left.localeCompare(right);
      },
      role: (a, b): number =>
        this.roleOrder[a.role] - this.roleOrder[b.role],
    };
  }

  get sorting(): string {
    return this.service.config.sorting || 'unsorted';
  }

  set sorting(val: string) {
    this.service.config.sorting = val;
    this.saveServiceConfig();
  }

  get sorter(): (a: ValidatedWidget, b: ValidatedWidget) => number {
    return this.allSorters[this.sorting] || (() => 0);
  }

  get expandedBlocks(): { [id: string]: boolean } {
    return this.service.config.expandedBlocks || {};
  }

  set expandedBlocks(expanded: { [id: string]: boolean }) {
    const ids = [...this.sparkModule!.blockIds, '_service'];
    this.service.config.expandedBlocks = Object.entries(expanded)
      .reduce(
        (acc, [k, v]) => {
          if (ids.includes(k)) { acc[k] = v; };
          return acc;
        },
        {},
      );
    this.saveServiceConfig();
  }

  get serviceExpanded(): boolean {
    return this.expandedBlocks['_service'] || false;
  }

  set serviceExpanded(val: boolean) {
    this.expandedBlocks = { ...this.expandedBlocks, ['_service']: val };
  }

  get serviceShown(): boolean {
    return !this.blockFilter ||
      !!this.service.id.toLowerCase().match(this.blockFilter.toLowerCase());
  }

  saveServiceConfig(): void {
    serviceStore.saveService({ ...this.service });
  }

  scrollTo(id: string): void {
    let item: any = this.$refs[`widget-${this.volatileKey(id)}`];
    item = isArray(item) ? item[0] : item;
    if (item !== undefined) {
      item.$el.scrollIntoView();
    }
  }

  selectService(): void {
    if (this.$dense && this.isReady) {
      createDialog({
        component: 'SparkWidgetDialog',
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
    if (!existing || existing.feature !== block.type) {
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
    return {
      id,
      key,
      crud,
      component,
      error,
      title: featureStore.widgetTitle(widget.feature),
      role: featureStore.widgetRole(widget.feature),
      expanded: this.expandedBlocks[widget.id] ?? false,
    };
  }

  get specIds(): BlockType[] {
    return sparkStore.specs.map(s => s.id);
  }

  get validatedItems(): ValidatedWidget[] {
    return this.sparkModule
      ?.blocks
      .filter(block => this.specIds.includes(block.type))
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
      parent: this,
      ...args,
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

  async discoverBlocks(): Promise<void> {
    if (!this.sparkModule) { return; }
    await this.sparkModule.clearDiscoveredBlocks();
    await this.sparkModule.fetchDiscoveredBlocks();
    await this.$nextTick();

    const discovered = this.sparkModule.discoveredBlocks;
    const message = discovered.length > 0
      ? `Discovered ${discovered.join(', ')}.`
      : 'Discovered no new blocks.';

    notify.info({ message, icon: 'mdi-magnify-plus-outline' });
  }

  async cleanUnusedNames(): Promise<void> {
    if (!this.sparkModule) { return; }
    const names = await this.sparkModule.cleanUnusedNames();

    const message = names.length > 0
      ? `Cleaned ${names.join(', ')}.`
      : 'No unused names found.';

    notify.info({ message, icon: 'mdi-tag-remove' });
  }

  async reboot(): Promise<void> {
    if (!this.sparkModule) { return; }
    await this.sparkModule.reboot();
  }

  onBlockClick(val: ValidatedWidget): void {
    if (this.$dense) {
      createDialog({
        component: 'WidgetDialog',
        parent: this,
        mode: 'Basic',
        getCrud: () => val.crud,
      });
    }
    else if (val.expanded) {
      this.scrollTo(val.id);
    }
    else {
      this.updateExpandedBlock(val.id, true);
    }
  }

  onPageDblClick(evt: Event): void {
    if (evt.target === evt.currentTarget) {
      this.startDialog('BlockWizardDialog');
    }
  }
}
</script>

<template>
  <q-page padding>
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
      <ActionMenu :disable="!isReady || statusNok" round size="12px" class="self-center">
        <template #actions>
          <ActionItem
            icon="add"
            label="New block"
            @click="startDialog('BlockWizardDialog')"
          />
          <ActionItem
            icon="mdi-magnify-plus-outline"
            label="Discover new OneWire blocks"
            @click="discoverBlocks"
          />
          <ActionItem
            icon="mdi-tag-remove"
            label="Remove unused block names"
            @click="cleanUnusedNames"
          />
          <ActionItem
            icon="mdi-download-network"
            label="Update firmware"
            @click="startDialog('FirmwareUpdateDialog')"
          />
          <ActionItem
            icon="wifi"
            label="Configure Wifi"
            @click="startDialog('SparkWifiMenu')"
          />
          <ActionItem
            icon="mdi-checkbox-multiple-marked"
            label="Groups (deprecated)"
            @click="startDialog('SparkGroupMenu')"
          />
          <ActionItem
            icon="mdi-restart"
            label="Reboot controller"
            @click="reboot"
          />
          <ActionItem
            icon="mdi-temperature-celsius"
            label="Configure used units"
            @click="startDialog('SparkUnitMenu')"
          />
          <ActionItem
            icon="mdi-file-export"
            label="Import/Export blocks"
            @click="startDialog('SparkImportMenu')"
          />
          <ActionItem
            icon="mdi-power-plug"
            label="Export hardware links"
            @click="saveHwInfo(service.id)"
          />
          <ActionItem
            icon="delete"
            label="Remove all blocks"
            @click="startResetBlocks(service.id)"
          />
        </template>
      </ActionMenu>
    </portal>

    <!-- Shown if service was found in store, but not ok -->
    <q-list v-if="statusNok">
      <q-item>
        <q-item-section>
          <Troubleshooter :service-id="service.id" />
        </q-item-section>
      </q-item>
    </q-list>

    <template v-else-if="pageMode === 'Relations'">
      <div class="page-height full-width">
        <RelationsDiagram
          :service-id="service.id"
          :nodes="nodes"
          :edges="edges"
        />
      </div>
    </template>

    <template v-else>
      <!-- Normal display -->
      <div class="row no-wrap justify-start page-height" @dblclick="onPageDblClick">
        <q-scroll-area visible class="content-column rounded-borders bg-dark">
          <q-list class="q-pr-md">
            <!-- Selection controls -->
            <q-item class="q-mb-md">
              <q-item-section>
                <q-input v-model="blockFilter" placeholder="Search blocks" clearable>
                  <template #append>
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
                    <q-icon :name="roleIcons[val.role]" />
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
        <q-scroll-area v-if="!$dense" visible class="content-column">
          <q-list class="q-ml-lg q-pr-none">
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
            <q-item class="page-height" @dblclick.native="onPageDblClick" />
          </q-list>
        </q-scroll-area>
      </div>
    </template>
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
