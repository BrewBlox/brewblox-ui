<script lang="ts">
import { Dialog,uid } from 'quasar';
import Vue from 'vue';
import Component from 'vue-class-component';
import { Watch } from 'vue-property-decorator';

import { objectSorter } from '@/helpers/functional';
import { deepCopy } from '@/helpers/shadow-copy';
import dashboardStore, { DashboardItem } from '@/store/dashboards';
import featureStore from '@/store/features';

interface VueOrdered extends Vue {
  id: string;
}

interface ValidatedItem {
  item: DashboardItem;
  component: string;
  error?: Error;
}

@Component
export default class DashboardPage extends Vue {
  widgetEditable: boolean = false;
  menuModalOpen: boolean = false;
  wizardModalOpen: boolean = false;

  get dashboardId(): string {
    return this.$route.params.id;
  }

  @Watch('dashboardId')
  onChangeDashboard() {
    this.widgetEditable = false;
  }

  get dashboard() {
    return dashboardStore.dashboardById(this.dashboardId);
  }

  get allDashboards() {
    return dashboardStore.dashboardValues;
  }

  get allItems() {
    return dashboardStore.itemValues;
  }

  get items() {
    return dashboardStore.dashboardItemsByDashboardId(this.dashboardId)
      .sort(objectSorter('order'));
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
      onChangeConfig: this.onChangeItemConfig,
      onChangeTitle: this.onChangeItemTitle,
      onDelete: this.onDeleteItem,
      onCopy: this.onCopyItem,
      onMove: this.onMoveItem,
    };
  }

  get validatedItems(): ValidatedItem[] {
    return this.items
      .map((item: DashboardItem) => {
        try {
          if (item.title === undefined) {
            // ensure backwards compatibility
            // older items may not have a title
            item.title = item.id;
          }
          const component = featureStore.widgetById(item.feature, item.config);
          if (!component) {
            throw new Error(`No widget found for ${item.feature}`);
          }
          const validator = featureStore.validatorById(item.feature);
          if (!validator(item.config)) {
            throw new Error(`${item.feature} validation failed`);
          }
          return { item, component };
        } catch (e) {
          return {
            item,
            component: 'InvalidWidget',
            error: e.toString(),
          };
        }
      })
      .map(validated => ({ ...validated, props: this.itemProps(validated.item) }));
  }

  get isMobile(): boolean {
    return this.$q.platform.is.mobile;
  }

  onChangeDashboardTitle(title: string) {
    dashboardStore.saveDashboard({ ...this.dashboard, title });
  }

  async onChangePositions(id: string, pinnedPosition: XYPosition | null, order: VueOrdered[]) {
    try {
      // Make a local change to the validated item, to avoid it "jumping" during the store round trip
      this.validatedItems
        .filter(valItem => valItem.item.id === id)
        .forEach(valItem => valItem.item.pinnedPosition = pinnedPosition);
      await dashboardStore.saveDashboardItem({ ...dashboardStore.dashboardItemById(id), pinnedPosition });
      await dashboardStore.updateDashboardItemOrder(order.map(item => item.id));
    } catch (e) {
      throw e;
    }
  }

  async onChangeSize(id: string, cols: number, rows: number) {
    await dashboardStore.updateDashboardItemSize({ id, cols, rows });
  }

  async onChangeItemConfig(id: string, config: any) {
    await dashboardStore.updateDashboardItemConfig({ id, config });
  }

  async onChangeItemTitle(id: string, title: string) {
    const item = dashboardStore.dashboardItemById(id);
    await dashboardStore.saveDashboardItem({ ...item, title });
  }

  onDeleteItem(itemId: string) {
    const item = dashboardStore.dashboardItemById(itemId);
    const deleteItem = () => dashboardStore.removeDashboardItem(item);

    // Quasar dialog can't handle objects as value - they will be returned as null
    // As workaround, we use array index as value, and add the "action" key to each option
    const opts = [
      {
        label: 'Remove widget from this dashboard',
        action: deleteItem,
      },
      ...featureStore.deletersById(item.feature)
        .map(del => ({ label: del.description, action: del.action })),
    ].map((opt, idx) => ({ ...opt, value: idx }));

    Dialog.create({
      title: 'Delete widget',
      message: `How do you want to delete widget ${item.title}?`,
      dark: true,
      options: {
        type: 'checkbox',
        model: [0], // pre-check the default action
        items: opts,
      },
      cancel: true,
    })
      .onOk((selected: number[]) => {
        selected.forEach(idx => opts[idx].action(item.config));
      });
  }

  onCopyItem(itemId: string) {
    const item = dashboardStore.dashboardItemById(itemId);
    const id = uid();
    Dialog.create({
      title: 'Copy widget',
      message: `To which dashboard do you want to copy widget ${item.title}?`,
      dark: true,
      options: {
        type: 'radio',
        model: null,
        items: this.allDashboards
          .map(dashboard => ({ label: dashboard.title, value: dashboard.id })),
      },
      cancel: true,
    })
      .onOk((dashboard: string) => {
        if (!dashboard) {
          return;
        }
        dashboardStore.appendDashboardItem({ ...deepCopy(item), id, dashboard, pinnedPosition: null });
        this.$q.notify({
          color: 'positive',
          icon: 'file_copy',
          message: `Copied ${item.title} to ${dashboardStore.dashboardById(dashboard).title}`,
        });
      });

  }

  onMoveItem(itemId: string) {
    const item = dashboardStore.dashboardItemById(itemId);
    Dialog.create({
      title: 'Move widget',
      message: `To which dashboard do you want to move widget ${item.title}?`,
      dark: true,
      options: {
        type: 'radio',
        model: null,
        items: this.allDashboards
          .filter(dashboard => dashboard.id !== this.dashboardId)
          .map(dashboard => ({ label: dashboard.title, value: dashboard.id })),
      },
      cancel: true,
    })
      .onOk((dashboard: string) =>
        dashboard && dashboardStore.saveDashboardItem({ ...item, dashboard, pinnedPosition: null }));
  }
}
</script>

<template>
  <q-page padding>
    <q-inner-loading v-if="!dashboard">
      <q-spinner size="50px" color="primary"/>
    </q-inner-loading>
    <div v-else>
      <portal to="toolbar-title">{{ dashboard.title }}</portal>
      <portal to="toolbar-buttons">
        <q-toggle v-model="widgetEditable" checked-icon="mdi-lock-open" unchecked-icon="mdi-lock">
          <q-tooltip>{{ widgetEditable ? 'Lock widgets' : 'Move widgets' }}</q-tooltip>
        </q-toggle>
        <q-btn-dropdown color="primary" label="actions">
          <q-list dark>
            <ActionItem icon="add" label="New Widget" @click="wizardModalOpen = true"/>
          </q-list>
        </q-btn-dropdown>
      </portal>
      <q-dialog v-model="wizardModalOpen" no-backdrop-dismiss>
        <WizardPicker
          v-if="wizardModalOpen"
          :dashboard-id="dashboardId"
          initial-component="WidgetWizardPicker"
          @close="wizardModalOpen = false"
        />
      </q-dialog>
      <q-list v-if="isMobile" no-border>
        <q-item v-for="val in validatedItems" :key="val.item.id">
          <q-item-section>
            <component
              :disabled="widgetEditable"
              :is="val.component"
              v-bind="val.props"
              class="dashboard-item"
            />
          </q-item-section>
        </q-item>
      </q-list>
      <GridContainer
        v-else
        :editable="widgetEditable"
        :on-change-positions="onChangePositions"
        :on-change-size="onChangeSize"
      >
        <component
          v-for="val in validatedItems"
          :disabled="widgetEditable"
          :is="val.component"
          :key="val.item.id"
          v-bind="val.props"
          class="dashboard-item"
        />
      </GridContainer>
    </div>
  </q-page>
</template>

<style lang="stylus" scoped>
@import '../styles/quasar.variables.styl';
@import '../styles/quasar.styl';

.dashboard-item {
  background: $block-background;
  height: 100%;
  width: 100%;
}
</style>
