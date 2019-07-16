<script lang="ts">
import { Dialog } from 'quasar';
import { clearTimeout, setInterval } from 'timers';
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { Watch } from 'vue-property-decorator';

import { capitalized, objectStringSorter } from '@/helpers/functional';
import { sparkStore } from '@/plugins/spark/store';
import { Block, Spark, SystemStatus } from '@/plugins/spark/types';
import { dashboardStore } from '@/store/dashboards';
import { Dashboard, DashboardItem } from '@/store/dashboards';
import { FeatureRole, featureStore } from '@/store/features';
import { serviceStore } from '@/store/services';

import { isReady, isSystemBlock } from './getters';

interface ModalSettings {
  component: string;
  props: any;
}

interface ValidatedItem {
  key: string;
  component: string;
  item: DashboardItem;
  typeName: string;
  role: FeatureRole;
  expanded: boolean;
}

@Component
export default class SparkPage extends Vue {
  capitalized = capitalized;

  @Prop({ type: String, required: true })
  readonly serviceId!: string;

  volatileItems: { [blockId: string]: DashboardItem } = {};
  statusCheckInterval: NodeJS.Timeout | null = null;
  blockFilter: string = '';

  get service(): Spark {
    return serviceStore.serviceById(this.serviceId) as Spark;
  }

  get dashboards(): Dashboard[] {
    return dashboardStore.dashboardValues;
  }

  get isAvailable() {
    return sparkStore.serviceAvailable(this.service.id);
  }

  get isReady() {
    return this.isAvailable && isReady(this.service.id);
  }

  get status(): SystemStatus | null {
    if (!this.isAvailable) {
      return null;
    }
    return sparkStore.lastStatus(this.service.id);
  }

  get statusNok() {
    return this.isAvailable && this.status && !this.status.synchronize;
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

  get allSorters(): { [id: string]: (a: ValidatedItem, b: ValidatedItem) => number } {
    return {
      unsorted: () => 0,
      name: (a, b) => objectStringSorter('title')(a.item, b.item),
      type: (a: ValidatedItem, b: ValidatedItem): number => {
        const left = featureStore.displayNameById(a.item.feature).toLowerCase();
        const right = featureStore.displayNameById(b.item.feature).toLowerCase();
        return left.localeCompare(right);
      },
      role: (a: ValidatedItem, b: ValidatedItem): number =>
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

  get sorter(): (a: ValidatedItem, b: ValidatedItem) => number {
    return this.allSorters[this.sorting] || (() => 0);
  }

  get expandedBlocks() {
    return this.service.config.expandedBlocks || {};
  }

  set expandedBlocks(expanded: { [id: string]: boolean }) {
    const ids = [...sparkStore.blockIds(this.service.id), '_service'];
    this.service.config.expandedBlocks = Object.entries(expanded)
      .reduce(
        (acc, [k, v]) => {
          return ids.includes(k)
            ? { ...acc, [k]: v }
            : acc;
        },
        {},
      );
    this.saveServiceConfig();
  }

  get serviceExpanded() {
    return this.expandedBlocks['_service'] || false;
  }

  set serviceExpanded(val: boolean) {
    this.expandedBlocks = { ...this.expandedBlocks, ['_service']: val };
  }

  get serviceShown() {
    return !this.blockFilter ||
      this.service.id.toLowerCase().match(this.blockFilter.toLowerCase());
  }

  saveServiceConfig() {
    serviceStore.saveService({ ...this.service });
  }

  updateExpandedBlock(id: string, val: boolean) {
    this.expandedBlocks = { ...this.expandedBlocks, [id]: val };
  }

  volatileKey(blockId: string): string {
    return `${this.service.id}/${blockId}`;
  }

  validateBlock(block: Block): ValidatedItem {
    const key = this.volatileKey(block.id);
    const existing = this.volatileItems[key];
    if (!existing || existing.feature !== block.type) {
      this.$set(
        this.volatileItems,
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
          ...featureStore.widgetSizeById(block.type),
        });
    }
    const item = this.volatileItems[key];
    return {
      key,
      item,
      typeName: featureStore.displayNameById(item.feature),
      role: featureStore.roleById(item.feature),
      component: featureStore.widgetById(item.feature, item.config) || 'InvalidWidget',
      expanded: this.expandedBlocks[item.id] || false,
    };
  }

  get validatedItems(): ValidatedItem[] {
    return [
      ...sparkStore.blockValues(this.service.id)
        .filter(block => !isSystemBlock(block))
        .map(this.validateBlock),
    ];
  }

  get filteredItems(): ValidatedItem[] {
    const filter = (this.blockFilter || '').toLowerCase();
    return this.validatedItems
      .filter(val => !filter
        || val.item.id.toLowerCase().match(filter)
        || val.typeName.toLowerCase().match(filter))
      .sort(this.sorter);
  }

  get expandedItems(): ValidatedItem[] {
    return this.filteredItems.filter(item => item.expanded);
  }

  expandAll() {
    this.expandedBlocks = [...sparkStore.blockIds(this.service.id), '_service']
      .reduce((acc, id) => ({ ...acc, [id]: true }), {});
  }

  expandNone() {
    this.expandedBlocks = {};
  }

  @Watch('statusNok', { immediate: true })
  autoRecheck() {
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

  saveWidget(widget: DashboardItem) {
    this.volatileItems[this.volatileKey(widget.id)] = { ...widget };
    this.$q.notify({
      color: 'warning',
      message: 'Changes will not be persisted',
    });
  }

  startDialog(component: string, props: any = null) {
    const args = props || {
      serviceId: this.service.id,
    };
    Dialog.create({
      component,
      root: this.$root,
      ...args,
    });
  }

  showRelations() {
    const nodes = this.validatedItems.map(v => ({ id: v.item.id, type: v.typeName }));
    const relations = sparkStore.blockLinks(this.service.id);

    Dialog.create({
      component: 'RelationsDialog',
      serviceId: this.service.id,
      nodes,
      relations,
    });
  }

  async discoverBlocks() {
    await sparkStore.clearDiscoveredBlocks(this.service.id);
    await sparkStore.fetchDiscoveredBlocks(this.service.id);
    await this.$nextTick();

    const discovered = sparkStore.discoveredBlocks(this.service.id);
    const message = discovered.length > 0
      ? `Discovered ${discovered.join(', ')}.`
      : 'Discovered no new blocks.';

    this.$q.notify({
      message,
      icon: 'mdi-magnify-plus-outline',
    });
  }

  async resetBlocks() {
    Dialog.create({
      title: 'Reset Blocks',
      message: `This will remove all Blocks on ${this.service.id}. Are you sure?`,
      dark: true,
      noBackdropDismiss: true,
      cancel: true,
    })
      .onOk(async () => {
        await sparkStore.clearBlocks(this.service.id)
          .then(() => this.$q.notify({
            icon: 'mdi-check-all',
            color: 'positive',
            message: 'Removed all Blocks',
          }))
          .catch((e) => this.$q.notify({
            icon: 'error',
            color: 'negative',
            message: `Failed to remove Blocks: ${e.toString()}`,
          }));
      });
  }

  async cleanUnusedNames() {
    const names = await sparkStore.cleanUnusedNames(this.service.id);

    const message = names.length > 0
      ? `Cleaned ${names.join(', ')}.`
      : 'No unused names found.';

    this.$q.notify({ message, icon: 'mdi-tag-remove' });
  }

  destroyed() {
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
      <q-btn-dropdown :disable="!isReady || statusNok" color="primary" label="actions">
        <q-list dark link>
          <ActionItem icon="mdi-ray-start-arrow" label="Show Relations" @click="showRelations" />
          <ActionItem icon="add" label="New Block" @click="startDialog('BlockWizardDialog')" />
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
          <!-- TODO(Bob) -->
          <!-- Disabled until ready for release -->
          <!-- <ActionItem
            icon="mdi-download-network"
            label="Update firmware"
            @click="startDialog('FirmwareUpdateDialog')"
          />-->
          <ActionItem icon="wifi" label="Configure Wifi" @click="startDialog('SparkWifiMenu')" />
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
          <ActionItem icon="delete" label="Remove all Blocks" @click="resetBlocks" />
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

    <!-- Normal display -->
    <div v-else class="row justify-start">
      <!-- Minimized widgets -->
      <q-list class="col-auto" dark no-border style="min-width: 400px">
        <!-- Selection controls -->
        <q-item dark class="q-mb-md">
          <q-item-section>
            <q-input v-model="blockFilter" placeholder="Search Blocks" clearable dark>
              <template v-slot:append>
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
        <q-item
          v-if="serviceShown"
          :class="['non-selectable', serviceExpanded ? 'text-primary' : 'text-white']"
          clickable
          dark
          @click.native="serviceExpanded = !serviceExpanded"
        >
          <q-item-section avatar>
            <q-icon name="mdi-cloud" />
            <q-tooltip>Service</q-tooltip>
          </q-item-section>
          <q-item-section>{{ serviceId }}</q-item-section>
          <q-item-section side>Spark Service</q-item-section>
        </q-item>
        <!-- Blocks -->
        <q-item
          v-for="val in filteredItems"
          :key="val.key"
          :class="['non-selectable', val.expanded ? 'text-primary' : 'text-white']"
          clickable
          dark
          @click.native="updateExpandedBlock(val.item.id, !val.expanded)"
        >
          <q-item-section avatar>
            <q-icon :name="roleIcons[val.role]" />
            <q-tooltip>{{ val.role }}</q-tooltip>
          </q-item-section>
          <q-item-section>{{ val.item.title }}</q-item-section>
          <q-item-section side>{{ val.typeName }}</q-item-section>
        </q-item>
      </q-list>

      <!-- Widget List -->
      <q-list class="col-auto q-ml-xl" dark no-border style="min-width: 500px">
        <!-- Service -->
        <q-item v-if="serviceShown && serviceExpanded" dark>
          <q-item-section>
            <SparkWidget v-if="isReady" :service-id="service.id" class="bg-dark" />
          </q-item-section>
        </q-item>
        <!-- Blocks -->
        <q-item v-for="val in expandedItems" :key="val.key" dark>
          <q-item-section>
            <component
              :is="val.component"
              :widget="val.item"
              volatile
              class="bg-dark"
              @update:widget="saveWidget"
            />
          </q-item-section>
        </q-item>
      </q-list>
    </div>
  </div>
</template>

<style lang="stylus" scoped>
@import '../../../styles/quasar.styl';
@import '../../../styles/quasar.variables.styl';
</style>
