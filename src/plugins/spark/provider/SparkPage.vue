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
import { allDashboards, itemCopyName } from '@/store/dashboards/getters';
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
    return allDashboards(this.$store);
  }

  defaultItem(block: Block): DashboardItem {
    const existing = this.volatileItems[block.id];
    if (!existing || existing.feature !== block.type) {
      this.$set(
        this.volatileItems,
        block.id,
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
    return this.volatileItems[block.id];
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

  get items() {
    return [
      ...allBlocks(this.$store, this.$props.serviceId)
        .filter(block => !isSystemBlock(block))
        .map(this.defaultItem),
    ];
  }

  get relations() {
    return blockLinks(this.$store, this.$props.serviceId);
  }

  get widgetSize() {
    return widgetSize;
  }

  widgetComponent(item: DashboardItem): string {
    return widgetById(this.$store, item.feature, item.config) || 'InvalidWidget';
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
    this.volatileItems[id].config = { ...config };
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
        <q-btn
          color="primary"
          icon="mdi-ray-start-arrow"
          label="Show Relations"
          @click="relationsModalOpen=true"
        />
        <q-btn
          :icon="widgetEditable ? 'check' : 'mode edit'"
          :color="widgetEditable ? 'positive' : 'primary'"
          :label="widgetEditable ? 'Stop editing' : 'Edit Dashboard'"
          @click="widgetEditable = !widgetEditable"
        />
        <q-btn color="primary" icon="add" label="New Block" @click="startCreateBlock"/>
      </portal>
      <q-modal v-model="modalOpen" no-backdrop-dismiss>
        <component v-if="modalOpen" :is="modalSettings.component" v-bind="modalSettings.props"/>
      </q-modal>
      <q-modal v-model="relationsModalOpen">
        <DagreDiagram
          v-if="relationsModalOpen"
          :nodes="items.map(i => ({id: i.id, type: i.feature}))"
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
      <GridContainer v-if="statusNok" :editable="widgetEditable" no-move>
        <Troubleshooter
          :disabled="widgetEditable"
          :id="$props.serviceId"
          :config="{serviceId: $props.serviceId}"
          :cols="4"
          :rows="4"
          type="Troubleshooter"
          class="dashboard-item"
        />
      </GridContainer>
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
          v-for="item in items"
          :disabled="widgetEditable"
          :is="widgetComponent(item)"
          :key="item.id"
          :id="item.id"
          :type="item.feature"
          :cols="item.cols"
          :rows="item.rows"
          :config="item.config"
          :on-change-config="onWidgetChange"
          :on-delete="() => onDeleteItem(item)"
          :on-copy="() => onCopyItem(item)"
          volatile
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
