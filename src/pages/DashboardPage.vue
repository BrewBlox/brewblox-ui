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
  dashboardItemById,
  dashboardItemsByDashboardId,
  itemCopyName,
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
  deletersById,
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
  widgetEditable: boolean = false;
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
    const deleteItem = () => removeDashboardItem(this.$store, item);

    // Quasar dialog can't handle objects as value - they will be returned as null
    // As workaround, we use array index as value, and add the "action" key to each option
    const opts = [
      {
        label: 'Remove widget from this dashboard',
        action: deleteItem,
      },
      ...deletersById(this.$store, item.widget)
        .map(del => ({ label: del.description, action: del.action })),
    ].map((opt, idx) => ({ ...opt, value: idx }));

    this.$q.dialog({
      title: 'Delete widget',
      message: `How do you want to delete widget ${item.id}?`,
      options: {
        type: 'checkbox',
        model: [0], // pre-check the default action
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
      title: 'Copy widget',
      message: `To which dashboard do you want to copy widget ${item.id}?`,
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

  onMoveItem(item: DashboardItem) {
    this.$q.dialog({
      title: 'Move widget',
      message: `To which dashboard do you want to move widget ${item.id}?`,
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
        dashboard && saveDashboardItem(this.$store, { ...item, dashboard }))
      .catch(() => { });
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
          v-if="widgetEditable"
          color="primary"
          icon="add"
          label="Copy Widget"
          @click="onStartCopyWidget"
        />

        <q-btn
          v-if="widgetEditable"
          color="primary"
          icon="add"
          label="New Widget"
          @click="onStartNewWidget"
        />

        <q-btn
          :disabled="editable"
          :icon="widgetEditable ? 'check' : 'mode edit'"
          :color="widgetEditable ? 'positive' : 'primary'"
          @click="() => widgetEditable = !widgetEditable"
          :label="widgetEditable ? 'Stop editing' : 'Edit widgets'"
        />

        <q-btn
          :disabled="widgetEditable"
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
          :is="widgetEditable ? 'EditWidget' : val.component"
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
