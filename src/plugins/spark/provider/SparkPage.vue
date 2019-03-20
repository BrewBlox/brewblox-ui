<script lang="ts">
import { serviceAvailable } from '@/helpers/dynamic-store';
import { Block, SystemStatus } from '@/plugins/spark/state';
import {
  createBlock,
  renameBlock,
  fetchAll,
  createUpdateSource,
  fetchServiceStatus,
} from '@/plugins/spark/store/actions';
import { allBlocks, lastStatus, blockLinks } from '@/plugins/spark/store/getters';
import { createDashboardItem } from '@/store/dashboards/actions';
import { dashboardValues, itemCopyName } from '@/store/dashboards/getters';
import { Dashboard, DashboardItem } from '@/store/dashboards/state';
import {
  deletersById,
  displayNameById,
  widgetById,
  widgetSizeById,
} from '@/store/features/getters';
import { Notify } from 'quasar';
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
  widgetEditable: boolean = false;
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

  itemProps(item: DashboardItem): any {
    return {
      id: item.id,
      type: item.feature,
      pos: item.pinnedPosition,
      cols: item.cols,
      rows: item.rows,
      config: item.config,
      onChangeConfig: this.onWidgetChange,
      onDelete: () => this.onDeleteItem(item),
      onCopy: () => this.onCopyItem(item),
      volatile: true,
    };
  }

  validateBlock(block: Block): ValidatedItem {
    const key = `${this.$props.serviceId}/${block.id}`;
    const existing = this.volatileItems[key];
    if (!existing || existing.feature !== block.type) {
      this.$set(
        this.volatileItems,
        key,
        {
          id: block.id,
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

  async onCreateBlock(block: Block) {
    try {
      await createBlock(this.$store, this.$props.serviceId, block);
      this.modalOpen = false;
      this.$q.notify({
        type: 'positive',
        message: `Created ${displayNameById(this.$store, block.type)} "${block.id}"`,
      });
    } catch (e) {
      this.$q.notify(`Failed to create block: ${e.toString()}`);
    }
  }

  onChangeBlockId(currentId: string, newId: string) {
    renameBlock(this.$store, this.$props.serviceId, currentId, newId);
  }

  onDeleteItem(item: DashboardItem) {
    // Quasar dialog can't handle objects as value - they will be returned as null
    // As workaround, we use array index as value, and add the "action" key to each option
    const opts = deletersById(this.$store, item.feature)
      .map((del, idx) => ({ label: del.description, value: idx, action: del.action }));

    if (opts.length === 0) {
      Notify.create('This block can\'t be deleted');
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
      .then((selected: number[]) =>
        selected.forEach(idx => opts[idx].action(this.$store, item.config)))
      .catch(() => { });
  }

  onCopyItem(item: DashboardItem) {
    const id = itemCopyName(this.$store, item.id);
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
      .then((dashboard: string) =>
        dashboard && createDashboardItem(this.$store, { ...item, id, dashboard }))
      .catch(() => { });
  }

  onWidgetChange(id: string, config: any) {
    const key = `${this.$props.serviceId}/${id}`;
    this.volatileItems[key].config = { ...config };
    this.$q.notify({
      type: 'warning',
      message: 'Changes will not be persisted',
    });
  }

  startCreateBlock() {
    this.modalSettings = {
      component: 'NewBlockWizard',
      props: {
        serviceId: this.$props.serviceId,
        onCreateBlock: this.onCreateBlock,
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
            <q-item @click.native="relationsModalOpen = true">
              <q-item-side icon="mdi-ray-start-arrow"/>
              <q-item-main label="Show Relations"/>
            </q-item>
            <q-item @click.native="widgetEditable = !widgetEditable">
              <q-item-side :icon="widgetEditable ? 'check' : 'mode edit'"/>
              <q-item-main :label="widgetEditable ? 'Stop editing' : 'Edit Dashboard'"/>
            </q-item>
            <q-item @click.native="startCreateBlock">
              <q-item-side icon="add"/>
              <q-item-main label="New Block"/>
            </q-item>
          </q-list>
        </q-btn-dropdown>
      </portal>
      <q-modal v-model="modalOpen" no-backdrop-dismiss>
        <component
          v-if="modalOpen"
          :is="modalSettings.component"
          v-bind="modalSettings.props"
          @close="modalOpen = false"
        />
      </q-modal>
      <q-modal v-model="relationsModalOpen" no-backdrop-dismiss>
        <DagreDiagram
          v-if="relationsModalOpen"
          :nodes="validatedItems.map(v => ({id: v.item.id, type: v.item.feature}))"
          :relations="relations"
        />
      </q-modal>
      <q-alert
        class="col-12"
        icon="info"
        color="dark-bright"
        style="margin-bottom: 20px;"
      >This service page shows all blocks that are running on your Spark controller.
        <br>Deleting blocks on this page will remove them on the controller.
      </q-alert>
      <q-list v-if="statusNok" dark no-border>
        <q-item>
          <Troubleshooter
            :disabled="widgetEditable"
            :id="$props.serviceId"
            :config="{serviceId: $props.serviceId}"
            :cols="4"
            :rows="4"
            type="Troubleshooter"
            class="dashboard-item"
          />
        </q-item>
      </q-list>
      <q-list v-else-if="isMobile" dark no-border>
        <q-item>
          <SparkWidget
            v-if="isReady"
            :disabled="widgetEditable"
            :id="$props.serviceId"
            :service-id="$props.serviceId"
            :cols="widgetSize.cols"
            :rows="widgetSize.rows"
            class="dashboard-item"
          />
        </q-item>
        <q-item v-for="val in validatedItems" :key="val.key">
          <component
            :disabled="widgetEditable"
            :is="val.component"
            v-bind="val.props"
            class="dashboard-item"
          />
        </q-item>
      </q-list>
      <GridContainer v-else :editable="widgetEditable" no-move>
        <SparkWidget
          v-if="isReady"
          :disabled="widgetEditable"
          :id="$props.serviceId"
          :service-id="$props.serviceId"
          :cols="widgetSize.cols"
          :rows="widgetSize.rows"
          class="dashboard-item"
        />
        <component
          v-for="val in validatedItems"
          :disabled="widgetEditable"
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
@import '../../../css/app.styl';

.dashboard-item {
  background: $block-background;
  height: 100%;
  width: 100%;
}
</style>
