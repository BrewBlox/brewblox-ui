<script lang="ts">
import { uid } from 'quasar';
import { serviceAvailable } from '@/helpers/dynamic-store';
import { Block, SystemStatus } from '@/plugins/spark/state';
import {
  renameBlock,
  fetchAll,
  createUpdateSource,
  fetchServiceStatus,
  fetchDiscoveredBlocks,
  clearDiscoveredBlocks,
  clearBlocks,
} from '@/plugins/spark/store/actions';
import { allBlocks, lastStatus, blockLinks, discoveredBlocks } from '@/plugins/spark/store/getters';
import { appendDashboardItem } from '@/store/dashboards/actions';
import { dashboardValues, dashboardById } from '@/store/dashboards/getters';
import { Dashboard, DashboardItem } from '@/store/dashboards/state';
import { deletersById, widgetById, widgetSizeById } from '@/store/features/getters';
import Vue from 'vue';
import Component from 'vue-class-component';
import { isReady, isSystemBlock, widgetSize } from './getters';
import { Watch } from 'vue-property-decorator';
import { setInterval, clearTimeout } from 'timers';
import { serviceById } from '@/store/services/getters';
import { Service } from '../../../store/services/state';

interface ModalSettings {
  component: string;
  props: any;
}

interface ValidatedItem {
  key: string;
  component: string;
  item: DashboardItem;
  props?: any;
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
  $q: any;
  volatileItems: { [blockId: string]: DashboardItem } = {};
  statusCheckInterval: NodeJS.Timeout | null = null;

  modalOpen: boolean = false;
  modalSettings: ModalSettings | null = null;
  relationsModalOpen: boolean = false;

  get service(): Service {
    return serviceById(this.$store, this.$props.serviceId);
  }

  get dashboards(): Dashboard[] {
    return dashboardValues(this.$store);
  }

  get isAvailable() {
    return serviceAvailable(this.$store, this.service.id);
  }

  get isReady() {
    return this.isAvailable && isReady(this.$store, this.service.id);
  }

  get status(): SystemStatus | null {
    if (!this.isAvailable) {
      return null;
    }
    return lastStatus(this.$store, this.service.id);
  }

  get statusNok() {
    return this.isAvailable && this.status && !this.status.synchronized;
  }

  get isMobile(): boolean {
    return this.$q.platform.is.mobile;
  }

  get relations() {
    return blockLinks(this.$store, this.service.id);
  }

  get widgetSize() {
    return widgetSize;
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
          ...widgetSizeById(this.$store, block.type),
        });
    }
    const item = this.volatileItems[key];
    return {
      key,
      item,
      component: widgetById(this.$store, item.feature, item.config) || 'InvalidWidget',
      props: this.itemProps(item),
    };
  }

  get validatedItems(): ValidatedItem[] {
    return [
      ...allBlocks(this.$store, this.service.id)
        .filter(block => !isSystemBlock(block))
        .map(this.validateBlock),
    ];
  }

  @Watch('statusNok', { immediate: true })
  autoRecheck() {
    if (this.statusNok && !this.statusCheckInterval) {
      this.statusCheckInterval = setInterval(
        () => fetchServiceStatus(this.$store, this.service.id),
        5000,
      );
    }
    if (!this.statusNok && this.statusCheckInterval) {
      fetchAll(this.$store, serviceById(this.$store, this.service.id));
      createUpdateSource(this.$store, this.service.id);
      clearTimeout(this.statusCheckInterval);
      this.statusCheckInterval = null;
      this.$forceUpdate();
    }
  }

  destroyed() {
    this.statusCheckInterval && clearTimeout(this.statusCheckInterval);
  }

  onChangeBlockId(currentId: string, newId: string) {
    renameBlock(this.$store, this.service.id, currentId, newId);
  }

  onDeleteItem(itemId: string) {
    const item = this.volatileItems[this.volatileKey(itemId)];
    // Quasar dialog can't handle objects as value - they will be returned as null
    // As workaround, we use array index as value, and add the "action" key to each option
    const opts = deletersById(this.$store, item.feature)
      .map((del, idx) => ({ label: del.description, value: idx, action: del.action }));

    if (opts.length === 0) {
      this.$q.notify('This block can\'t be deleted');
      return;
    }

    this.$q.dialog({
      title: 'Delete block',
      message: `How do you want to delete ${item.id}?`,
      options: {
        type: 'checkbox',
        model: opts.map(opt => opt.value),
        items: opts,
      },
      cancel: true,
    })
      .onOk((selected: number[]) =>
        selected.forEach(idx => opts[idx].action(this.$store, item.config)));
  }

  onCopyItem(itemId: string) {
    const item = this.volatileItems[this.volatileKey(itemId)];
    const id = uid();
    this.$q.dialog({
      title: 'Create widget',
      message: `On which dashboard do you want to create a widget for ${item.id}?`,
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
        appendDashboardItem(this.$store, { ...item, id, dashboard });
        this.$q.notify({
          color: 'positive',
          icon: 'file_copy',
          message: `Copied ${item.title} to ${dashboardById(this.$store, dashboard).title}`,
        });
      });
  }

  onWidgetChange(id: string, config: any) {
    this.volatileItems[this.volatileKey(id)].config = { ...config };
    this.$q.notify({
      type: 'warning',
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
    await clearDiscoveredBlocks(this.$store, this.service.id);
    await fetchDiscoveredBlocks(this.$store, this.service.id);
    await this.$nextTick();

    const discovered = discoveredBlocks(this.$store, this.service.id);
    const message = discovered.length > 0
      ? `Discovered ${discovered.join(', ')}`
      : 'Discovered no new blocks';

    this.$q.notify({
      message,
      icon: 'mdi-magnify-plus-outline',
    });
  }

  async resetBlocks() {
    this.$q.dialog({
      title: 'Reset Blocks',
      message: `This will remove all Blocks on ${this.service.id}. Are you sure?`,
      noBackdropDismiss: true,
      cancel: true,
    })
      .onOk(async () => {
        await clearBlocks(this.$store, this.service)
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
}
</script>

<template>
  <div>
    <template>
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
              icon="mdi-content-save-all"
              label="Savepoints"
              @click="startDialog('SparkSavepointMenu')"
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
        <DagreDiagram
          v-if="relationsModalOpen"
          :nodes="validatedItems.map(v => ({id: v.item.id, type: v.item.feature}))"
          :relations="relations"
        />
      </q-dialog>
      <q-banner icon="info" class="bg-dark text-white q-mb-lg">
        This service page shows all blocks that are running on your Spark controller.
        <br>Deleting blocks on this page will remove them on the controller.
      </q-banner>
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
              class="dashboard-item"
            />
          </q-item-section>
        </q-item>
      </q-list>
      <q-list v-else-if="isMobile" dark no-border>
        <q-item dark>
          <q-item-section>
            <SparkWidget
              v-if="isReady"
              :id="service.id"
              :service-id="service.id"
              :cols="widgetSize.cols"
              :rows="widgetSize.rows"
              class="dashboard-item"
            />
          </q-item-section>
        </q-item>
        <q-item v-for="val in validatedItems" :key="val.key" dark>
          <q-item-section>
            <component :is="val.component" v-bind="val.props" class="dashboard-item"/>
          </q-item-section>
        </q-item>
      </q-list>
      <GridContainer v-else no-move>
        <SparkWidget
          v-if="isReady"
          :id="service.id"
          :service-id="service.id"
          :cols="widgetSize.cols"
          :rows="widgetSize.rows"
          class="dashboard-item"
        />
        <component
          v-for="val in validatedItems"
          :is="val.component"
          :key="val.key"
          v-bind="val.props"
          class="dashboard-item"
        />
      </GridContainer>
    </template>
  </div>
</template>

<style lang="stylus" scoped>
@import '../../../styles/quasar.styl';
@import '../../../styles/quasar.variables.styl';

.dashboard-item {
  background: $block-background;
  height: 100%;
  width: 100%;
}
</style>
