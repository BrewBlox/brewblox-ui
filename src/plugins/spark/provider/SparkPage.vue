<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';
import { uid, Dialog } from 'quasar';
import dashboardStore from '@/store/dashboards';
import featureStore, { FeatureRole } from '@/store/features';
import serviceStore from '@/store/services';
import sparkStore from '@/plugins/spark/store';
import { Block, SystemStatus, Spark } from '@/plugins/spark/types';
import { Dashboard, DashboardItem } from '@/store/dashboards';
import { isReady, isSystemBlock, widgetSize } from './getters';
import { Watch } from 'vue-property-decorator';
import { setInterval, clearTimeout } from 'timers';
import { objectStringSorter, capitalized } from '@/helpers/functional';
import { deepCopy } from '@/helpers/shadow-copy';

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
  props?: any;
  expanded: boolean;
}

@Component({
  props: {
    serviceId: {
      type: String,
      required: true,
    },
  },
})
export default class SparkPage extends Vue {
  capitalized = capitalized;

  volatileItems: { [blockId: string]: DashboardItem } = {};
  statusCheckInterval: NodeJS.Timeout | null = null;
  blockFilter: string = '';

  modalOpen: boolean = false;
  modalSettings: ModalSettings | null = null;
  relationsModalOpen: boolean = false;

  get service(): Spark {
    return serviceStore.serviceById(this.$props.serviceId) as Spark;
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
    return this.isAvailable && this.status && !this.status.synchronized;
  }

  get nodes() {
    return this.validatedItems.map(v => ({ id: v.item.id, type: v.typeName }));
  }

  get relations() {
    return sparkStore.blockLinks(this.service.id);
  }

  get sparkWidgetProps() {
    return {
      id: this.service.id,
      serviceId: this.service.id,
      ...widgetSize,
    };
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
      Process: 'mdi-gauge',
      Control: 'mdi-calculator-variant',
      Output: 'mdi-engine-outline',
      Constraint: 'mdi-lock-outline',
      Other: 'mdi-cube',
    };
  }

  get allSorters(): { [id: string]: (a: ValidatedItem, b: ValidatedItem) => number } {
    return {
      unsorted: () => 0,
      name: (a, b) => objectStringSorter('title')(a.props, b.props),
      type: (a: ValidatedItem, b: ValidatedItem): number => {
        const left = featureStore.displayNameById(a.item.feature).toLowerCase();
        const right = featureStore.displayNameById(b.item.feature).toLowerCase();
        if (left < right) {
          return -1;
        }
        if (right > left) {
          return 1;
        }
        return 0;
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

  itemProps(item: DashboardItem): any {
    return {
      id: item.id,
      title: item.title,
      type: item.feature,
      pos: item.pinnedPosition,
      cols: item.cols,
      rows: item.rows,
      config: item.config,
      onChangeConfig: this.onWidgetChange,
      onDelete: this.onDeleteItem,
      onCopy: this.onCopyItem,
      volatile: true,
    };
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
      props: this.itemProps(item),
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

  onChangeBlockId(currentId: string, newId: string) {
    sparkStore.renameBlock([this.service.id, currentId, newId]);
  }

  onDeleteItem(itemId: string) {
    const item = this.volatileItems[this.volatileKey(itemId)];
    // Quasar dialog can't handle objects as value - they will be returned as null
    // As workaround, we use array index as value, and add the "action" key to each option
    const opts = featureStore.deletersById(item.feature)
      .map((del, idx) => ({ label: del.description, value: idx, action: del.action }));

    if (opts.length === 0) {
      this.$q.notify({
        color: 'negative',
        message: "This block can't be deleted",
      });
      return;
    }

    Dialog.create({
      title: 'Delete block',
      message: `How do you want to delete ${item.id}?`,
      dark: true,
      options: {
        type: 'checkbox',
        model: opts.map(opt => opt.value),
        items: opts,
      },
      cancel: true,
    })
      .onOk((selected: number[]) =>
        selected.forEach(idx => opts[idx].action(item.config)));
  }

  onCopyItem(itemId: string) {
    const item = this.volatileItems[this.volatileKey(itemId)];
    const id = uid();
    Dialog.create({
      title: 'Create widget',
      message: `On which dashboard do you want to create a widget for ${item.id}?`,
      dark: true,
      options: {
        type: 'radio',
        model: null,
        items: this.dashboards
          .map(dashboard => ({ label: dashboard.title, value: dashboard.id })),
      },
      cancel: true,
    })
      .onOk((dashboard: string) => {
        if (!dashboard) {
          return;
        }
        dashboardStore.appendDashboardItem({ ...deepCopy(item), id, dashboard });
        this.$q.notify({
          color: 'positive',
          icon: 'file_copy',
          message: `Copied ${item.title} to ${dashboardStore.dashboardById(dashboard).title}`,
        });
      });
  }

  onWidgetChange(id: string, config: any) {
    this.volatileItems[this.volatileKey(id)].config = { ...config };
    this.$q.notify({
      color: 'warning',
      message: 'Changes will not be persisted',
    });
  }

  startDialog(component: string, props: any = null) {
    this.modalSettings = {
      component,
      props: props || {
        serviceId: this.service.id,
      },
    };
    this.modalOpen = true;
  }

  async discoverBlocks() {
    await sparkStore.clearDiscoveredBlocks(this.service.id);
    await sparkStore.fetchDiscoveredBlocks(this.service.id);
    await this.$nextTick();

    const discovered = sparkStore.discoveredBlocks(this.service.id);
    const message = discovered.length > 0
      ? `Discovered ${discovered.join(', ')}`
      : 'Discovered no new blocks';

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
          <ActionItem
            icon="mdi-ray-start-arrow"
            label="Show Relations"
            @click="relationsModalOpen = true"
          />
          <ActionItem icon="add" label="New Block" @click="startDialog('BlockWizard')"/>
          <ActionItem
            icon="mdi-magnify-plus-outline"
            label="Discover new OneWire Blocks"
            @click="discoverBlocks"
          />
          <ActionItem icon="wifi" label="Configure Wifi" @click="startDialog('SparkWifiMenu')"/>
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
          <ActionItem icon="delete" label="Remove all Blocks" @click="resetBlocks"/>
        </q-list>
      </q-btn-dropdown>
    </portal>

    <q-dialog v-model="modalOpen" no-backdrop-dismiss>
      <component
        v-if="modalOpen"
        :is="modalSettings.component"
        v-bind="modalSettings.props"
        @close="modalOpen = false"
      />
    </q-dialog>
    <q-dialog v-model="relationsModalOpen" no-backdrop-dismiss maximized>
      <DagreDiagram v-if="relationsModalOpen" :nodes="nodes" :relations="relations"/>
    </q-dialog>

    <!-- Shown if service was found in store, but not ok -->
    <q-list v-if="statusNok" dark no-border>
      <q-item dark>
        <q-item-section>
          <Troubleshooter
            :id="service.id"
            :config="{serviceId: service.id}"
            :cols="4"
            :rows="4"
            title="Troubleshooter"
            type="Troubleshooter"
            class="bg-dark"
          />
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
                <q-icon name="search"/>
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
            <q-btn flat round icon="mdi-checkbox-multiple-blank-outline" @click="expandNone"/>
            <q-tooltip>Unselect all</q-tooltip>
          </q-item-section>
          <q-item-section class="col-auto">
            <q-btn flat round icon="mdi-checkbox-multiple-marked" @click="expandAll"/>
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
            <q-icon name="mdi-cloud"/>
            <q-tooltip>Service</q-tooltip>
          </q-item-section>
          <q-item-section>{{ $props.serviceId }}</q-item-section>
          <q-item-section side>Spark Service</q-item-section>
        </q-item>
        <!-- Blocks -->
        <q-item
          v-for="val in filteredItems"
          :key="val.key"
          :class="['non-selectable', val.expanded ? 'text-primary' : 'text-white']"
          clickable
          dark
          @click.native="updateExpandedBlock(val.props.id, !val.expanded)"
        >
          <q-item-section avatar>
            <q-icon :name="roleIcons[val.role]"/>
            <q-tooltip>{{ val.role }}</q-tooltip>
          </q-item-section>
          <q-item-section>{{ val.props.title }}</q-item-section>
          <q-item-section side>{{ val.typeName }}</q-item-section>
        </q-item>
      </q-list>

      <!-- Widget List -->
      <q-list class="col-auto q-ml-xl" dark no-border style="min-width: 500px">
        <!-- Service -->
        <q-item v-if="serviceShown && serviceExpanded" dark>
          <q-item-section>
            <SparkWidget v-if="isReady" v-bind="sparkWidgetProps" class="bg-dark"/>
          </q-item-section>
        </q-item>
        <!-- Blocks -->
        <q-item v-for="val in expandedItems" :key="val.key" dark>
          <q-item-section>
            <component :is="val.component" v-bind="val.props" class="bg-dark"/>
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
