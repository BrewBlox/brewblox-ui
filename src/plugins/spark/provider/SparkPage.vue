<script lang="ts">
import { uid } from 'quasar';
import { serviceAvailable } from '@/helpers/dynamic-store';
import { Block, SystemStatus } from '@/plugins/spark/state';
import {
  renameBlock,
  fetchAll,
  createUpdateSource,
  fetchServiceStatus,
} from '@/plugins/spark/store/actions';
import { allBlocks, lastStatus, blockLinks } from '@/plugins/spark/store/getters';
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
  modalOpen: boolean = false;
  relationsModalOpen: boolean = false;
  modalSettings: ModalSettings | null = null;
  volatileItems: { [blockId: string]: DashboardItem } = {};
  statusCheckInterval: NodeJS.Timeout | null = null;

  get dashboards(): Dashboard[] {
    return dashboardValues(this.$store);
  }

  get isAvailable() {
    return serviceAvailable(this.$store, this.$props.serviceId);
  }

  get isReady() {
    return this.isAvailable && isReady(this.$store, this.$props.serviceId);
  }

  get status(): SystemStatus | null {
    if (!this.isAvailable) {
      return null;
    }
    return lastStatus(this.$store, this.$props.serviceId);
  }

  get statusNok() {
    return this.isAvailable && this.status && !this.status.synchronized;
  }

  get isMobile(): boolean {
    return this.$q.platform.is.mobile;
  }

  get relations() {
    return blockLinks(this.$store, this.$props.serviceId);
  }

  get widgetSize() {
    return widgetSize;
  }

  volatileKey(blockId: string): string {
    return `${this.$props.serviceId}/${blockId}`;
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
      ...allBlocks(this.$store, this.$props.serviceId)
        .filter(block => !isSystemBlock(block))
        .map(this.validateBlock),
    ];
  }

  @Watch('statusNok', { immediate: true })
  autoRecheck() {
    if (this.statusNok && !this.statusCheckInterval) {
      this.statusCheckInterval = setInterval(
        () => fetchServiceStatus(this.$store, this.$props.serviceId),
        5000,
      );
    }
    if (!this.statusNok && this.statusCheckInterval) {
      fetchAll(this.$store, serviceById(this.$store, this.$props.serviceId));
      createUpdateSource(this.$store, this.$props.serviceId);
      clearTimeout(this.statusCheckInterval);
      this.statusCheckInterval = null;
      this.$forceUpdate();
    }
  }

  destroyed() {
    this.statusCheckInterval && clearTimeout(this.statusCheckInterval);
  }

  onChangeBlockId(currentId: string, newId: string) {
    renameBlock(this.$store, this.$props.serviceId, currentId, newId);
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

  startCreateBlock() {
    this.modalSettings = {
      component: 'BlockWizard',
      props: {
        serviceId: this.$props.serviceId,
      },
    };
    this.modalOpen = true;
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
        <q-btn-dropdown color="primary" label="actions">
          <q-list dark link>
            <q-item v-close-popup dark clickable @click="relationsModalOpen = true">
              <q-item-section avatar>
                <q-icon name="mdi-ray-start-arrow"/>
              </q-item-section>
              <q-item-section>Show Relations</q-item-section>
            </q-item>
            <q-item dark clickable @click="startCreateBlock">
              <q-item-section avatar>
                <q-icon name="add"/>
              </q-item-section>
              <q-item-section>New Block</q-item-section>
            </q-item>
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
              :id="$props.serviceId"
              :config="{serviceId: $props.serviceId}"
              :cols="4"
              :rows="4"
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
              :id="$props.serviceId"
              :service-id="$props.serviceId"
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
          :id="$props.serviceId"
          :service-id="$props.serviceId"
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
