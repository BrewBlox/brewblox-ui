<script lang="ts">
import Vue, { VueConstructor } from 'vue';
import { Notify } from 'quasar';
import Component from 'vue-class-component';
import CopyWidgetDialog from '@/components/Dialog/CopyWidgetDialog.vue';
import shortid from 'shortid';
import { objectSorter } from '@/helpers/functional';
import { Block } from '@/plugins/spark/state';
import { DashboardItem } from '@/store/dashboards/state';
import {
  allDashboards,
  dashboardById,
  dashboardItemIds,
  dashboardItemById,
  dashboardItemsByDashboardId,
} from '@/store/dashboards/getters';
import {
  saveDashboard,
  updateDashboardItemOrder,
  updateDashboardItemSize,
  updateDashboardItemConfig,
  createDashboardItem,
  saveDashboardItem,
  removeDashboardItem,
} from '@/store/dashboards/actions';
import {
  validatorById,
  widgetById,
  displayNameById,
  widgetSizeById,
  onDeleteById,
} from '@/store/features/getters';

interface VueOrdered extends Vue {
  id: string;
}

interface ModalConfig {
  open: boolean;
  title: string;
  component?: string;
}

interface ValidatedItem {
  item: DashboardItem;
  component: string;
  error?: Error;
}

@Component
export default class DashboardPage extends Vue {
  $q: any;
  editable: boolean = false;
  copyDialogOpen: boolean = false;
  title: string = '';

  wizardModal: ModalConfig = {
    open: false,
    title: '',
  };

  get dashboardId(): string {
    return this.$route.params.id;
  }

  get dashboard() {
    return dashboardById(this.$store, this.dashboardId);
  }

  get dashboards() {
    return allDashboards(this.$store);
  }

  get items() {
    return dashboardItemsByDashboardId(this.$store, this.dashboardId)
      .sort(objectSorter('order'));
  }

  get itemIds() {
    return dashboardItemIds(this.$store);
  }

  get validatedItems(): ValidatedItem[] {
    return this.items
      .map((item) => {
        try {
          const component = widgetById(this.$store, item.widget);
          if (!component) {
            throw new Error(`No widget found for ${item.widget}`);
          }
          const validator = validatorById(this.$store, item.widget);
          if (!validator(this.$store, item.config)) {
            throw new Error(`${item.widget} validation failed`);
          }
          return {
            item,
            component,
          };
        } catch (e) {
          return {
            item,
            component: 'InvalidWidget',
            error: e.toString(),
          };
        }
      });
  }

  onStartEdit() {
    this.title = this.dashboard.title;
    this.editable = true;
  }

  onStopEdit() {
    if (this.title !== this.dashboard.title) {
      // update title of dashboard if changed
      saveDashboard(this.$store, {
        ...this.dashboard,
        title: this.title,
      });
    }
    this.editable = false;
  }

  async onChangeOrder(order: VueOrdered[]) {
    const newOrder = order.map(item => item.id);
    try {
      await updateDashboardItemOrder(this.$store, newOrder);
    } catch (e) {
      throw e;
    }
  }

  onChangeSize(id: string, cols: number, rows: number) {
    updateDashboardItemSize(this.$store, { id, cols, rows });
  }

  onChangeItemConfig(id: string, config: any) {
    updateDashboardItemConfig(this.$store, { id, config });
  }

  onStartCopyWidget() {
    this.wizardModal = {
      open: true,
      component: 'CopyWidgetWizard',
      title: 'Copy Existing Widget',
    };
  }

  onStartNewWidget() {
    this.wizardModal = {
      open: true,
      component: 'NewWidgetWizard',
      title: 'Add New Widget',
    };
  }

  defaultItem(): DashboardItem {
    return {
      id: shortid.generate(),
      widget: 'Unknown',
      dashboard: this.dashboardId,
      order: this.items.length + 1,
      config: {},
      ...widgetSizeById(this.$store, 'Unknown'),
    };
  }

  async onCreateItem(partial: Partial<DashboardItem>) {
    try {
      const item: DashboardItem = { ...this.defaultItem(), ...partial };
      await createDashboardItem(this.$store, item);
      Notify.create({
        type: 'positive',
        message: `Added ${displayNameById(this.$store, item.widget)} "${item.id}"`,
      });
    } catch (e) {
      Notify.create(`Failed to add widget: ${e.toString()}`);
    }
  }

  onDeleteItem(item: DashboardItem) {
    // Check whether the feature has a separate deleter
    const onDeleteFeature = onDeleteById(this.$store, item.widget);
    const opts = onDeleteFeature
      ? [{ label: 'Also delete widget in service', value: true }]
      : [];

    this.$q.dialog({
      title: `Delete widget ${item.id}`,
      message: '',
      options: {
        type: 'radio',
        model: null,
        items: opts,
      },
      cancel: true,
    })
      .then((del: boolean) => {
        if (del) {
          (onDeleteFeature as Function)(this.$store, item.config);
        }
        removeDashboardItem(this.$store, item);
      });
  }

  generateItemCopyName(id: string) {
    const copyName = (i: number): string =>
      (id.match(/\(\d+\)$/)
        ? id.replace(/\(\d+\)$/, `(${i})`)
        : `${id}(${i})`);

    let idx = 2;
    while (this.itemIds.includes(copyName(idx))) {
      idx += 1;
    }
    return copyName(idx);
  }

  onCopyItem(item: DashboardItem) {
    const id = this.generateItemCopyName(item.id);
    this.$q.dialog({
      title: `Copy widget ${item.id}`,
      message: 'Select a dashboard.',
      options: {
        type: 'radio',
        model: null,
        items: this.dashboards
          .map(dashboard => ({ label: dashboard.title, value: dashboard.id })),
      },
      cancel: true,
    })
      .then((dashboard: string) =>
        dashboard && createDashboardItem(this.$store, { ...item, id, dashboard }));
  }

  onMoveItem(item: DashboardItem) {
    this.$q.dialog({
      title: `Move widget ${item.id}`,
      message: 'Select a dashboard.',
      options: {
        type: 'radio',
        model: null,
        items: this.dashboards
          .filter(dashboard => dashboard.id !== this.dashboardId)
          .map(dashboard => ({ label: dashboard.title, value: dashboard.id })),
      },
      cancel: true,
    })
      .then((dashboard: string) =>
        dashboard && saveDashboardItem(this.$store, { ...item, dashboard }));
  }
}
</script>

<template>
  <q-page padding>
    <q-inner-loading>
      <q-spinner
        size="50px"
        color="primary"
      />
    </q-inner-loading>

    <template>
      <portal to="toolbar-title">
        <div v-if="!editable">
          {{ dashboard.title }}
        </div>
        <div v-else>
          <q-input
            v-model="title"
            placeholder="Name of this dashboard"
            dark
            :before="[{ icon: 'edit' }]"
          />
        </div>
      </portal>

      <portal to="toolbar-buttons">

        <q-btn
          v-if="editable"
          color="primary"
          icon="add"
          label="Copy Widget"
          @click="onStartCopyWidget"
        />

        <q-btn
          v-if="editable"
          color="primary"
          icon="add"
          label="New Widget"
          @click="onStartNewWidget"
        />

        <q-btn
          :icon="editable ? 'check' : 'mode edit'"
          :color="editable ? 'positive' : 'primary'"
          @click="editable ? onStopEdit() : onStartEdit()"
          :label="editable ? 'Stop editing' : 'Edit dashboard'"
        />

      </portal>

      <WidgetModal
        :isOpen="wizardModal.open"
        :title="wizardModal.title"
        :onClose="() => { this.wizardModal.open = false; }"
      >
        <component
          v-if="wizardModal.open"
          :is="wizardModal.component"
          :onCreateItem="onCreateItem"
        />
      </WidgetModal>

      <GridContainer
        :editable="editable"
        :on-change-order="onChangeOrder"
        :on-change-size="onChangeSize"
      >
        <component
          class="dashboard-item"
          v-for="val in validatedItems"
          :disabled="editable"
          :is="val.component"
          :error="val.error"
          :key="val.item.id"
          :id="val.item.id"
          :type="val.item.widget"
          :cols="val.item.cols"
          :rows="val.item.rows"
          :config="val.item.config"
          :onConfigChange="onChangeItemConfig"
          :onDeleteItem="() => onDeleteItem(val.item)"
          :onCopyItem="() => onCopyItem(val.item)"
          :onMoveItem="() => onMoveItem(val.item)"
        />
      </GridContainer>
    </template>
  </q-page>
</template>

<style lang="stylus" scoped>
@import '../css/app.styl';

.dashboard-item {
  background: $block-background;
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
}
</style>
