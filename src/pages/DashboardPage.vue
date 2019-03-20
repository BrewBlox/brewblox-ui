<script lang="ts">
import { objectSorter } from '@/helpers/functional';
import {
  removeDashboardItem,
  saveDashboard,
  saveDashboardItem,
  updateDashboardItemConfig,
  updateDashboardItemId,
  updateDashboardItemOrder,
  updateDashboardItemSize,
  appendDashboardItem,
} from '@/store/dashboards/actions';
import {
  dashboardValues,
  dashboardById,
  dashboardItemsByDashboardId,
  itemCopyName,
  dashboardItemValues,
  dashboardItemById,
} from '@/store/dashboards/getters';
import { DashboardItem } from '@/store/dashboards/state';
import {
  deletersById,
  validatorById,
  widgetById,
} from '@/store/features/getters';
import Vue from 'vue';
import Component from 'vue-class-component';
import { Watch } from 'vue-property-decorator';

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
  $q: any;
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
    return dashboardById(this.$store, this.dashboardId);
  }

  get allDashboards() {
    return dashboardValues(this.$store);
  }

  get allItems() {
    return dashboardItemValues(this.$store);
  }

  get items() {
    return dashboardItemsByDashboardId(this.$store, this.dashboardId)
      .sort(objectSorter('order'));
  }

  itemProps(item: DashboardItem): any {
    return {
      id: item.id,
      type: item.feature,
      pos: item.pinnedPosition,
      cols: item.cols,
      rows: item.rows,
      config: item.config,
      onChangeConfig: this.onChangeItemConfig,
      onChangeId: v => this.onChangeItemId(item.id, v),
      onDelete: () => this.onDeleteItem(item),
      onCopy: () => this.onCopyItem(item),
      onMove: () => this.onMoveItem(item),
    };
  }

  get validatedItems(): ValidatedItem[] {
    return this.items
      .map((item) => {
        try {
          const component = widgetById(this.$store, item.feature, item.config);
          if (!component) {
            throw new Error(`No widget found for ${item.feature}`);
          }
          const validator = validatorById(this.$store, item.feature);
          if (!validator(this.$store, item.config)) {
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
    saveDashboard(this.$store, { ...this.dashboard, title });
  }

  async onChangePositions(id: string, pinnedPosition: XYPosition | null, order: VueOrdered[]) {
    try {
      // Make a local change to the validated item, to avoid it "jumping" during the store round trip
      this.validatedItems
        .filter(valItem => valItem.item.id === id)
        .forEach(valItem => valItem.item.pinnedPosition = pinnedPosition);
      await saveDashboardItem(
        this.$store,
        { ...dashboardItemById(this.$store, id), pinnedPosition },
      );
      await updateDashboardItemOrder(this.$store, order.map(item => item.id));
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

  onChangeItemId(id: string, newId: string) {
    updateDashboardItemId(this.$store, { id, newId })
      .catch(e => this.$q.notify(`Failed to rename ${id}: ${e}`));
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
      ...deletersById(this.$store, item.feature)
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
        items: this.allDashboards
          .map(dashboard => ({ label: dashboard.title, value: dashboard.id })),
      },
      cancel: true,
    })
      .then((dashboard: string) =>
        dashboard && appendDashboardItem(this.$store, { ...item, id, dashboard }))
      .catch(() => { });
  }

  onMoveItem(item: DashboardItem) {
    this.$q.dialog({
      title: 'Move widget',
      message: `To which dashboard do you want to move widget ${item.id}?`,
      options: {
        type: 'radio',
        model: null,
        items: this.allDashboards
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
    <q-inner-loading v-if="!dashboard">
      <q-spinner size="50px" color="primary"/>
    </q-inner-loading>
    <div v-else>
      <portal to="toolbar-title">
        <div :class="widgetEditable ? 'editable': ''">
          <span>{{ dashboard.title }}</span>
          <q-popup-edit
            :disable="!widgetEditable"
            v-model="dashboard.title"
            title="Set dashboard title to:"
            @save="onChangeDashboardTitle"
          >
            <q-input v-model="dashboard.title"/>
          </q-popup-edit>
        </div>
      </portal>
      <portal to="toolbar-buttons">
        <q-btn-dropdown color="primary" label="actions">
          <q-list dark link>
            <q-item @click.native="widgetEditable = !widgetEditable">
              <q-item-side :icon="widgetEditable ? 'check' : 'mode edit'"/>
              <q-item-main :label="widgetEditable ? 'Stop editing' : 'Edit Dashboard'"/>
            </q-item>
            <q-item @click.native="() => wizardModalOpen = true">
              <q-item-side icon="add"/>
              <q-item-main label="New Widget"/>
            </q-item>
          </q-list>
        </q-btn-dropdown>
      </portal>
      <q-modal v-model="wizardModalOpen" no-backdrop-dismiss>
        <WidgetWizardPicker
          v-if="wizardModalOpen"
          :dashboard-id="dashboardId"
          @close="wizardModalOpen = false"
        />
      </q-modal>
      <q-list v-if="isMobile" no-border>
        <q-item v-for="val in validatedItems" :key="val.item.id">
          <component
            :disabled="widgetEditable"
            :is="val.component"
            v-bind="val.props"
            class="dashboard-item"
          />
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
@import '../css/app.styl';

.dashboard-item {
  background: $block-background;
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
}
</style>
