<script lang="ts">
import { clearTimeout, setInterval } from 'timers';
import { isArray } from 'util';
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { Watch } from 'vue-property-decorator';

import { createDialog } from '@/helpers/dialog';
import { capitalized, mutate, objectStringSorter } from '@/helpers/functional';
import { startResetBlocks } from '@/plugins/spark/helpers';
import { sparkStore } from '@/plugins/spark/store';
import { Block, BlockCrud, RelationEdge, RelationNode, Spark, SystemStatus } from '@/plugins/spark/types';
import { Dashboard, dashboardStore, PersistentWidget } from '@/store/dashboards';
import { FeatureRole, featureStore, WidgetContext } from '@/store/features';
import { serviceStore } from '@/store/services';

import { isReady, isSystemBlock } from './getters';

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

@Component
export default class SparkPage extends Vue {
  capitalized = capitalized;
  startResetBlocks = startResetBlocks;

  volatileWidgets: { [blockId: string]: PersistentWidget } = {};
  statusCheckInterval: NodeJS.Timeout | null = null;
  blockFilter = '';
  pageMode: 'Relations' | 'Widgets' = 'Widgets';

  context: WidgetContext = {
    mode: 'Basic',
    container: 'Dashboard',
  };

  @Prop({ type: String, required: true })
  readonly serviceId!: string;

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

  get contentStyle(): Mapped<string> {
    return {
      height: `${window.innerHeight - 100}px`,
    };
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
    this.serviceExpanded = true;
    let item: any = this.$refs['widget-spark-service'];
    item = isArray(item) ? item[0] : item;
    if (item !== undefined) {
      item.$el.scrollIntoView();
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

  saveWidget(widget: PersistentWidget): void {
    this.volatileWidgets[this.volatileKey(widget.id)] = { ...widget };
    this.$q.notify({
      color: 'warning',
      message: 'Changes will not be persisted',
    });
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
    return this.validatedItems.map(v => ({ id: v.id, type: v.displayName }));
  }

  get edges(): RelationEdge[] {
    return sparkStore.relations(this.service.id);
  }

  showRelations(): void {
    createDialog({
      parent: this,
      component: 'RelationsDialog',
      serviceId: this.service.id,
      nodes: this.nodes,
      edges: this.edges,
    });
  }

  async discoverBlocks(): Promise<void> {
    await sparkStore.clearDiscoveredBlocks(this.service.id);
    await sparkStore.fetchDiscoveredBlocks(this.service.id);
    await this.$nextTick();

    const discovered = sparkStore.discoveredBlocks(this.service.id);
    const message = discovered.length > 0
      ? `Discovered ${discovered.join(', ')}.`
      : 'Discovered no new blocks.';

    this.$q.notify({ message, icon: 'mdi-magnify-plus-outline' });
  }

  async cleanUnusedNames(): Promise<void> {
    const names = await sparkStore.cleanUnusedNames(this.service.id);

    const message = names.length > 0
      ? `Cleaned ${names.join(', ')}.`
      : 'No unused names found.';

    this.$q.notify({ message, icon: 'mdi-tag-remove' });
  }

  destroyed(): void {
    this.statusCheckInterval && clearTimeout(this.statusCheckInterval);
  }
}
</script>

<template>
  <div>
    <portal to="toolbar-title">
      <div>Blocks</div>
    </portal>
    <portal to="toolbar-buttons">
      <q-btn-toggle
        v-model="pageMode"
        class="q-mr-md"
        dark
        flat
        dense
        :options="[
          {icon:'mdi-widgets', value: 'Widgets'},
          {icon:'mdi-lan', value: 'Relations'},
        ]"
      />
      <q-btn-dropdown :disable="!isReady || statusNok" color="primary" label="actions">
        <q-list dark link>
          <ActionItem
            icon="mdi-ray-start-arrow"
            label="Show Relations"
            @click="showRelations"
          />
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
        </q-list>
      </q-btn-dropdown>
    </portal>

    <!-- Shown if service was found in store, but not ok -->
    <q-list v-if="statusNok" dark no-border>
      <q-item dark>
        <q-item-section>
          <Troubleshooter :service-id="service.id" class="bg-dark" />
        </q-item-section>
      </q-item>
    </q-list>

    <template v-else-if="pageMode === 'Relations'">
      <RelationsDiagram
        :service-id="service.id"
        :nodes="nodes"
        :edges="edges"
        :content-style="contentStyle"
      />
    </template>

    <template v-else>
      <!-- Normal display -->
      <div class="row no-wrap justify-start" :style="contentStyle">
        <q-scroll-area class="row no-wrap col-auto" style="width: 500px">
          <q-list dark no-border class="col">
            <!-- Selection controls -->
            <q-item dark class="q-mb-md">
              <q-item-section>
                <q-input v-model="blockFilter" placeholder="Search Blocks" clearable dark>
                  <template #append>
                    <q-icon name="search" />
                  </template>
                </q-input>
              </q-item-section>
              <q-item-section class="col-auto">
                <q-btn-dropdown :label="sorting" icon="mdi-sort" flat>
                  <q-list dark>
                    <ActionItem
                      v-for="(func, name) in allSorters"
                      :key="name"
                      :active="sorting === name"
                      :label="capitalized(name)"
                      @click="sorting = name"
                    />
                  </q-list>
                </q-btn-dropdown>
                <q-tooltip>Sort Blocks</q-tooltip>
              </q-item-section>
              <q-item-section class="col-auto">
                <q-btn flat round icon="mdi-checkbox-multiple-blank-outline" @click="expandNone" />
                <q-tooltip>Unselect all</q-tooltip>
              </q-item-section>
              <q-item-section class="col-auto">
                <q-btn flat round icon="mdi-checkbox-multiple-marked" @click="expandAll" />
                <q-tooltip>Select all</q-tooltip>
              </q-item-section>
            </q-item>
            <!-- Service -->
            <q-item v-if="serviceShown" dark class="text-white widget-index">
              <q-item-section side class="q-mx-none q-px-none">
                <ToggleButton v-model="serviceExpanded" />
              </q-item-section>
              <q-item-section>
                <q-item class="non-selectable" clickable dark @click="selectService">
                  <q-item-section avatar>
                    <q-icon name="mdi-information-variant" />
                    <q-tooltip>Device Info</q-tooltip>
                  </q-item-section>
                  <q-item-section>{{ serviceId }}</q-item-section>
                  <q-item-section side>
                    Device Info
                  </q-item-section>
                </q-item>
              </q-item-section>
            </q-item>
            <!-- Blocks -->
            <q-item
              v-for="val in filteredItems"
              :key="val.key"
              dark
              class="non-selectable text-white widget-index"
            >
              <q-item-section side class="q-mx-none q-px-none">
                <ToggleButton :value="val.expanded" @input="v => updateExpandedBlock(val.id, v)" />
              </q-item-section>
              <q-item-section>
                <q-item
                  clickable
                  dark
                  @click="val.expanded ? scrollTo(val.id) : updateExpandedBlock(val.id, true)"
                >
                  <q-item-section avatar>
                    <q-icon :name="roleIcons[val.role]" />
                    <q-tooltip>{{ val.role }}</q-tooltip>
                  </q-item-section>
                  <q-item-section>{{ val.id }}</q-item-section>
                  <q-item-section side>
                    {{ val.displayName }}
                  </q-item-section>
                </q-item>
              </q-item-section>
            </q-item>
          </q-list>
        </q-scroll-area>

        <!-- Widget List -->
        <q-scroll-area class="col-auto q-ml-xl" style="min-width: 500px; max-width: 500px">
          <q-list dark no-border>
            <!-- Service -->
            <q-item v-if="serviceShown && serviceExpanded" ref="widget-spark-service" dark>
              <q-item-section>
                <SparkWidget v-if="isReady" :service-id="service.id" class="bg-dark" />
              </q-item-section>
            </q-item>
            <!-- Blocks -->
            <q-item v-for="val in expandedItems" :ref="`widget-${val.key}`" :key="val.key" dark>
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
            <q-item dark :style="{height: contentStyle.height}" />
          </q-list>
        </q-scroll-area>
      </div>
    </template>
  </div>
</template>

<style lang="stylus" scoped>
@import '../../../styles/quasar.styl';
@import '../../../styles/quasar.variables.styl';

.widget-index {
  padding: 0;
}
</style>
