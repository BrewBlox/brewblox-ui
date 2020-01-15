<script lang="ts">
import { clearTimeout, setInterval } from 'timers';
import { isArray } from 'util';
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { Watch } from 'vue-property-decorator';

import { createDialog } from '@/helpers/dialog';
import { capitalized, mutate, objectStringSorter } from '@/helpers/functional';
import notify from '@/helpers/notify';
import { isSystemBlock } from '@/plugins/spark/block-types';
import { startResetBlocks } from '@/plugins/spark/helpers';
import { sparkStore } from '@/plugins/spark/store';
import { Block, BlockCrud, PageMode, RelationEdge, RelationNode, Spark, SystemStatus } from '@/plugins/spark/types';
import { Dashboard, dashboardStore, PersistentWidget } from '@/store/dashboards';
import { FeatureRole, featureStore, WidgetContext } from '@/store/features';
import { serviceStore } from '@/store/services';

import { isReady } from './getters';
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
  displayName: string;
  role: FeatureRole;
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

  volatileWidgets: { [blockId: string]: PersistentWidget } = {};
  statusCheckInterval: NodeJS.Timeout | null = null;
  blockFilter = '';

  context: WidgetContext = {
    mode: 'Basic',
    container: 'Dashboard',
  };

  @Prop({ type: String, required: true })
  readonly serviceId!: string;

  @Watch('statusNok', { immediate: true })
  autoRecheck(): void {
    if (this.statusNok && !this.statusCheckInterval) {
      this.statusCheckInterval = setInterval(
        () => sparkStore.fetchServiceStatus(this.service.id),
        5000,
      );
    }
    if (!this.statusNok && this.statusCheckInterval) {
      sparkStore.fetchAll(this.service.id);
      sparkStore.createUpdateSource(this.service.id);
      clearTimeout(this.statusCheckInterval);
      this.statusCheckInterval = null;
      this.$forceUpdate();
    }
  }

  destroyed(): void {
    this.statusCheckInterval && clearTimeout(this.statusCheckInterval);
  }

  get service(): Spark {
    return serviceStore.serviceById(this.serviceId) as Spark;
  }

  get dashboards(): Dashboard[] {
    return dashboardStore.dashboardValues;
  }

  get isAvailable(): boolean {
    return sparkStore.serviceAvailable(this.service.id);
  }

  get isReady(): boolean {
    return this.isAvailable && isReady(this.service.id);
  }

  get status(): SystemStatus | null {
    if (!this.isAvailable) {
      return null;
    }
    return sparkStore.lastStatus(this.service.id);
  }

  get statusNok(): boolean {
    return Boolean(this.isAvailable && this.status && !this.status.synchronize);
  }

  get roleOrder(): Record<FeatureRole, number> {
    return {
      Display: 0,
      Process: 1,
      Control: 2,
      Output: 3,
      Constraint: 4,
      Other: 5,
    };
  }

  get roleIcons(): Record<FeatureRole, string> {
    return {
      Display: 'mdi-monitor-dashboard',
      Process: 'mdi-thermometer',
      Control: 'mdi-calculator-variant',
      Output: 'mdi-power-plug',
      Constraint: 'mdi-lock-outline',
      Other: 'mdi-cube',
    };
  }

  get pageMode(): PageMode {
    return this.service.config.pageMode || 'List';
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
        const left = a.displayName.toLowerCase();
        const right = b.displayName.toLowerCase();
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
    const ids = [...sparkStore.blockIds(this.service.id), '_service'];
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
    try {
      return {
        id: widget.id,
        key,
        crud,
        displayName: featureStore.displayName(widget.feature),
        role: featureStore.role(widget.feature),
        component: featureStore.widget(crud, true),
        expanded: this.expandedBlocks[widget.id] || false,
      };
    } catch (e) {
      return {
        id: widget.id,
        key,
        crud,
        displayName: 'Invalid Widget',
        role: 'Other',
        component: 'InvalidWidget',
        expanded: this.expandedBlocks[widget.id] || false,
        error: e.message,
      };
    }
  }

  get validatedItems(): ValidatedWidget[] {
    return [
      ...sparkStore.blockValues(this.service.id)
        .filter(block => !isSystemBlock(block))
        .map(this.validateBlock),
    ];
  }

  get filteredItems(): ValidatedWidget[] {
    const filter = (this.blockFilter || '').toLowerCase();
    return this.validatedItems
      .filter(val => !filter
        || val.id.toLowerCase().match(filter)
        || val.displayName.toLowerCase().match(filter))
      .sort(this.sorter);
  }

  get expandedItems(): ValidatedWidget[] {
    return this.filteredItems.filter(item => item.expanded);
  }

  expandAll(): void {
    this.expandedBlocks = [...sparkStore.blockIds(this.service.id), '_service']
      .reduce((acc, id) => mutate(acc, id, true), {});
  }

  expandNone(): void {
    this.expandedBlocks = {};
  }

  saveWidget(widget: PersistentWidget): void {
    this.volatileWidgets[this.volatileKey(widget.id)] = { ...widget };
    notify.warn('Changes will not be persisted', { logged: false });
  }

  async saveBlock(block: Block): Promise<void> {
    sparkStore.saveBlock([block.serviceId, block]);
  }

  startDialog(component: string, props: any = null): void {
    const args = props || {
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
      .map(v => ({ id: v.id, type: v.displayName }))
      .sort(objectStringSorter('type'));
  }

  get edges(): RelationEdge[] {
    return sparkStore.relations(this.service.id);
  }

  async discoverBlocks(): Promise<void> {
    await sparkStore.clearDiscoveredBlocks(this.service.id);
    await sparkStore.fetchDiscoveredBlocks(this.service.id);
    await this.$nextTick();

    const discovered = sparkStore.discoveredBlocks(this.service.id);
    const message = discovered.length > 0
      ? `Discovered ${discovered.join(', ')}.`
      : 'Discovered no new blocks.';

    notify.info({ message, icon: 'mdi-magnify-plus-outline' });
  }

  async cleanUnusedNames(): Promise<void> {
    const names = await sparkStore.cleanUnusedNames(this.service.id);

    const message = names.length > 0
      ? `Cleaned ${names.join(', ')}.`
      : 'No unused names found.';

    notify.info({ message, icon: 'mdi-tag-remove' });
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
}
</script>

<template>
  <div>
    <portal to="toolbar-title">
      {{ service.title }}
    </portal>
    <portal to="toolbar-buttons">
      <q-btn-group flat stretch>
        <q-btn
          flat
          stretch
          :class="{'selected-mode': pageMode === 'List'}"
          icon="mdi-format-list-checkbox"
          @click="pageMode = 'List'"
        >
          <q-tooltip>Show blocks as list</q-tooltip>
        </q-btn>
        <q-btn
          flat
          stretch
          :class="{'selected-mode': pageMode === 'Relations'}"
          icon="mdi-vector-line"
          @click="pageMode = 'Relations'"
        >
          <q-tooltip>Show blocks as diagram</q-tooltip>
        </q-btn>
      </q-btn-group>
      <ActionMenu :disable="!isReady || statusNok" stretch>
        <template #actions>
          <ActionItem
            icon="add"
            label="New Block"
            @click="startDialog('BlockWizardDialog')"
          />
          <ActionItem
            icon="mdi-magnify-plus-outline"
            label="Discover new OneWire Blocks"
            @click="discoverBlocks"
          />
          <ActionItem
            icon="mdi-tag-remove"
            label="Remove unused Block names"
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
            label="Groups"
            @click="startDialog('SparkGroupMenu')"
          />
          <ActionItem
            icon="mdi-temperature-celsius"
            label="Units"
            @click="startDialog('SparkUnitMenu')"
          />
          <ActionItem
            icon="mdi-file-export"
            label="Import/Export Blocks"
            @click="startDialog('SparkImportMenu')"
          />
          <ActionItem
            icon="mdi-test-tube"
            label="Create Mock Blocks"
            @click="startDialog('CreateMockMenu')"
          />
          <ActionItem
            icon="delete"
            label="Remove all Blocks"
            @click="startResetBlocks(service.id)"
          />
        </template>
      </ActionMenu>
    </portal>

    <!-- Shown if service was found in store, but not ok -->
    <q-list v-if="statusNok">
      <q-item>
        <q-item-section>
          <Troubleshooter :service-id="service.id" class="bg-dark" />
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
      <div class="row no-wrap justify-start page-height">
        <q-list class="content-column q-pr-md">
          <!-- Selection controls -->
          <q-item class="q-mb-md">
            <q-item-section>
              <q-input v-model="blockFilter" placeholder="Search Blocks" clearable>
                <template #append>
                  <q-icon name="search" />
                </template>
              </q-input>
            </q-item-section>
            <q-item-section class="col-auto">
              <q-btn icon="mdi-sort" flat>
                <q-tooltip>Sort Blocks</q-tooltip>
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
            <q-item-section v-if="!$dense" side class="q-mx-none q-px-none">
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
            :key="val.key"
            class="non-selectable text-white widget-index"
          >
            <q-item-section v-if="!$dense" side class="q-mx-none q-px-none">
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
                    {{ val.displayName }}
                  </q-item-label>
                  <div style="font-size: larger">
                    {{ val.id }}
                  </div>
                </q-item-section>
              </q-item>
            </q-item-section>
          </q-item>
        </q-list>

        <!-- Widget List -->
        <q-list v-if="!$dense" class="content-column q-ml-lg q-pr-lg">
          <!-- Service -->
          <q-item v-if="serviceShown && serviceExpanded" ref="widget-spark-service">
            <q-item-section>
              <SparkWidget v-if="isReady" :service-id="service.id" class="bg-dark" />
            </q-item-section>
          </q-item>
          <!-- Blocks -->
          <q-item v-for="val in expandedItems" :ref="`widget-${val.key}`" :key="val.key">
            <q-item-section>
              <component
                :is="val.component"
                :initial-crud="val.crud"
                :context="context"
                :error="val.error"
                class="bg-dark"
              />
            </q-item-section>
          </q-item>
          <!-- Blank space to always be able to show a widget at the top -->
          <q-item class="page-height" />
        </q-list>
      </div>
    </template>
  </div>
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
  overflow: auto

.selected-mode
  border-bottom: 2px solid $secondary
</style>
